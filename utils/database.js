// database.js
import { Sequelize, DataTypes } from "sequelize";

// Conexão com o Postgres do Render
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// MODELOS
export const User = sequelize.define("User", {
  id: { type: DataTypes.STRING, primaryKey: true },
  coins: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastDaily: { type: DataTypes.BIGINT, defaultValue: 0 },
});

export const ShopItem = sequelize.define("ShopItem", {
  item: { type: DataTypes.STRING, primaryKey: true },
  price: { type: DataTypes.INTEGER },
});

export const Inventory = sequelize.define("Inventory", {
  userId: {
    type: DataTypes.STRING,
    references: {
      model: User,
      key: "id",
    },
  },
  item: { type: DataTypes.STRING },
});

// Relação: User → Inventory
User.hasMany(Inventory, { foreignKey: "userId" });
Inventory.belongsTo(User, { foreignKey: "userId" });

// INICIALIZAÇÃO DO BANCO
export async function initDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // cria tabelas se não existirem
    console.log("✅ Banco PostgreSQL conectado e sincronizado!");
  } catch (err) {
    console.error("❌ Erro ao conectar ao banco:", err);
  }
}

// FUNÇÕES SIMILARES AO SQLITE

export async function getUser(id) {
  let user = await User.findByPk(id);
  if (!user) {
    user = await User.create({ id, coins: 0, lastDaily: 0 });
    console.log(`Novo usuário criado: ${id}`);
  } else {
    console.log(`Usuário existente encontrado: ${id}`);
  }
  return user;
}

export async function updateCoins(id, amount) {
  const user = await getUser(id);
  user.coins += amount;
  await user.save();
  console.log(`Moedas de ${id} atualizadas para ${user.coins}`);
}

export async function setDaily(id, timestamp) {
  const user = await getUser(id);
  user.lastDaily = timestamp;
  await user.save();
  console.log(`Timestamp do último daily atualizado para ${timestamp}`);
}

export async function addItemToShop(item, price) {
  await ShopItem.upsert({ item, price });
  console.log(`Item adicionado/atualizado na loja: ${item} com preço ${price}`);
}

export async function getShop() {
  const shopItems = await ShopItem.findAll();
  console.log("Itens da loja:", shopItems.map(i => i.toJSON()));
  return shopItems.map(i => i.toJSON());
}

export async function buyItem(userId, itemName) {
  const item = await ShopItem.findByPk(itemName);
  if (!item) return { success: false, message: "❌ Esse item não existe!" };

  const user = await getUser(userId);
  if (user.coins < item.price) return { success: false, message: "💸 Você não tem dinheiro suficiente!" };

  // Remove moedas e adiciona item ao inventário
  await updateCoins(userId, -item.price);
  await Inventory.create({ userId, item: itemName });

  console.log(`Usuário ${userId} comprou o item: ${itemName} por ${item.price} moedas.`);
  return { success: true, message: `✅ Você comprou **${itemName}** por ${item.price} moedas!` };
}

export async function getInventory(userId) {
  const inventory = await Inventory.findAll({ where: { userId } });
  console.log(`Inventário do usuário ${userId}:`, inventory.map(i => i.item));
  return inventory.map(i => i.item);
}

