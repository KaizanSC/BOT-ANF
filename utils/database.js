// utils/database.js
import { Sequelize, DataTypes } from "sequelize";

// Conexão com o PostgreSQL do Render
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

// ---------------------- MODELOS ----------------------
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

// Relação User → Inventory
User.hasMany(Inventory, { foreignKey: "userId" });
Inventory.belongsTo(User, { foreignKey: "userId" });

// ---------------------- FUNÇÃO DE INICIALIZAÇÃO ----------------------
export async function initDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Cria tabelas se não existirem
    console.log("✅ Banco PostgreSQL conectado e sincronizado!");
  } catch (err) {
    console.error("❌ Erro ao conectar ao banco:", err);
  }
}

// ---------------------- FUNÇÕES DO BOT ----------------------

// Pegar ou criar usuário
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

// Atualizar moedas
export async function updateCoins(id, amount) {
  const user = await getUser(id);
  user.coins += amount;
  await user.save();
  console.log(`Moedas de ${id} atualizadas para ${user.coins}`);
}

// Atualizar daily
export async function setDaily(id, timestamp) {
  const user = await getUser(id);
  user.lastDaily = timestamp;
  await user.save();
  console.log(`Timestamp do último daily atualizado para ${timestamp}`);
}

// Adicionar item à loja
export async function addItemToShop(item, price) {
  await ShopItem.upsert({ item, price });
  console.log(`Item adicionado/atualizado na loja: ${item} com preço ${price}`);
}

// Obter todos os itens da loja
export async function getShop() {
  const shopItems = await ShopItem.findAll();
  return shopItems.map(i => i.toJSON());
}

// Comprar item
export async function buyItem(userId, itemName) {
  const item = await ShopItem.findByPk(itemName);
  if (!item) return { success: false, message: "❌ Esse item não existe!" };

  const user = await getUser(userId);
  if (user.coins < item.price) return { success: false, message: "💸 Você não tem dinheiro suficiente!" };

  await updateCoins(userId, -item.price);
  await Inventory.create({ userId, item: itemName });

  console.log(`Usuário ${userId} comprou o item: ${itemName} por ${item.price} moedas.`);
  return { success: true, message: `✅ Você comprou **${itemName}** por ${item.price} moedas!` };
}

// Obter inventário de um usuário
export async function getInventory(userId) {
  const inventory = await Inventory.findAll({ where: { userId } });
  return inventory.map(i => i.item);
}
