import { Sequelize, DataTypes } from "sequelize";

// ---------------------- CONEXÃO ----------------------
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
});

// ---------------------- MODELOS ----------------------

// Usuário padrão com cooldowns
export const User = sequelize.define("User", {
  id: { type: DataTypes.STRING, primaryKey: true },
  coins: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastDaily: { type: DataTypes.BIGINT, defaultValue: 0 },
  lastSteal: { type: DataTypes.BIGINT, defaultValue: 0 },       // cooldown roubar
  lastAdventure: { type: DataTypes.BIGINT, defaultValue: 0 },   // cooldown aventura
  lastScratch: { type: DataTypes.BIGINT, defaultValue: 0 },     // cooldown raspadinha
});

// Loja padrão
export const ShopItem = sequelize.define("ShopItem", {
  item: { type: DataTypes.STRING, primaryKey: true },
  price: { type: DataTypes.INTEGER },
});

// Inventário padrão
export const Inventory = sequelize.define("Inventory", {
  userId: { type: DataTypes.STRING, references: { model: User, key: "id" } },
  item: { type: DataTypes.STRING },
});

// Relações
User.hasMany(Inventory, { foreignKey: "userId" });
Inventory.belongsTo(User, { foreignKey: "userId" });

// ---------------------- INICIALIZAÇÃO ----------------------
export async function initDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Atualiza tabela se houver novas colunas
    console.log("✅ Banco PostgreSQL conectado e sincronizado!");
  } catch (err) {
    console.error("❌ Erro ao conectar ao banco:", err);
  }
}

// ---------------------- FUNÇÕES DO BOT ----------------------

// Pegar ou criar usuário
export async function getUser(id) {
  let user = await User.findByPk(id);
  if (!user) user = await User.create({ id });
  return user;
}

// Atualizar moedas (ANF Coins)
export async function updateCoins(id, amount) {
  const user = await getUser(id);
  user.coins += amount;
  await user.save();
}

// Atualizar daily
export async function setDaily(id, timestamp) {
  const user = await getUser(id);
  user.lastDaily = timestamp;
  await user.save();
}

// ---------------------- LOJA ----------------------
export async function addItemToShop(item, price) {
  await ShopItem.upsert({ item, price });
}

export async function getShop() {
  const items = await ShopItem.findAll();
  return items.map(i => i.toJSON());
}

export async function buyItem(userId, itemName) {
  const item = await ShopItem.findByPk(itemName);
  if (!item) return { success: false, message: "❌ Esse item não existe!" };

  const user = await getUser(userId);
  if (user.coins < item.price) return { success: false, message: "💸 Você não tem ANF Coins suficientes!" };

  await updateCoins(userId, -item.price);
  await Inventory.create({ userId, item: itemName });

  return { success: true, message: `✅ Você comprou **${itemName}** por ${item.price} ANF Coins!` };
}

// ---------------------- INVENTÁRIO ----------------------
export async function getInventory(userId) {
  const inv = await Inventory.findAll({ where: { userId } });
  return inv.map(i => i.item);
}
