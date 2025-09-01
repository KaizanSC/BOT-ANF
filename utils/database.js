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

// Usuário padrão
export const User = sequelize.define("User", {
  id: { type: DataTypes.STRING, primaryKey: true },
  coins: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastDaily: { type: DataTypes.BIGINT, defaultValue: 0 },
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

User.hasMany(Inventory, { foreignKey: "userId" });
Inventory.belongsTo(User, { foreignKey: "userId" });

// ---------------------- RPG ----------------------

// Usuário RPG
export const RPGUser = sequelize.define("RPGUser", {
  id: { type: DataTypes.STRING, primaryKey: true },
  coins: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastDaily: { type: DataTypes.BIGINT, defaultValue: 0 },
});

// Loja RPG
export const RPGShop = sequelize.define("RPGShop", {
  item: { type: DataTypes.STRING, primaryKey: true },
  price: { type: DataTypes.INTEGER },
  tipo: { type: DataTypes.STRING, defaultValue: "item" },
});

// Inventário RPG
export const RPGInventory = sequelize.define("RPGInventory", {
  userId: { type: DataTypes.STRING, references: { model: RPGUser, key: "id" } },
  item: { type: DataTypes.STRING },
});

RPGUser.hasMany(RPGInventory, { foreignKey: "userId" });
RPGInventory.belongsTo(RPGUser, { foreignKey: "userId" });

// ---------------------- INICIALIZAÇÃO ----------------------
export async function initDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("✅ Banco PostgreSQL conectado e sincronizado!");
  } catch (err) {
    console.error("❌ Erro ao conectar ao banco:", err);
  }
}

// ---------------------- FUNÇÕES BOT PADRÃO ----------------------

// Pegar ou criar usuário
export async function getUser(id) {
  let user = await User.findByPk(id);
  if (!user) user = await User.create({ id });
  return user;
}

// Atualizar moedas
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

// Loja
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
  if (user.coins < item.price) return { success: false, message: "💸 Você não tem moedas suficientes!" };

  await updateCoins(userId, -item.price);
  await Inventory.create({ userId, item: itemName });

  return { success: true, message: `✅ Você comprou **${itemName}** por ${item.price} moedas!` };
}

// Inventário
export async function getInventory(userId) {
  const inv = await Inventory.findAll({ where: { userId } });
  return inv.map(i => i.item);
}

// ---------------------- FUNÇÕES RPG ----------------------

// Pegar ou criar usuário RPG
export async function getRPGUser(id) {
  let user = await RPGUser.findByPk(id);
  if (!user) user = await RPGUser.create({ id });
  return user;
}

// Atualizar moedas RPG
export async function updateRPGCoins(id, amount) {
  const user = await getRPGUser(id);
  user.coins += amount;
  await user.save();
}

// Loja RPG
export async function addRPGShopItem(item, price, tipo = "item") {
  await RPGShop.upsert({ item, price, tipo });
}

export async function getRPGShop() {
  const items = await RPGShop.findAll();
  return items.map(i => i.toJSON());
}

export async function buyRPGItem(userId, itemName) {
  const item = await RPGShop.findByPk(itemName);
  if (!item) return { success: false, message: "❌ Esse item não existe!" };

  const user = await getRPGUser(userId);
  if (user.coins < item.price) return { success: false, message: "💸 Você não tem RPGCoins suficientes!" };

  await updateRPGCoins(userId, -item.price);
  await RPGInventory.create({ userId, item: item.item });

  return { success: true, message: `✅ Você comprou **${item.item}** por ${item.price} RPGCoins!` };
}

// Inventário RPG
export async function getRPGInventory(userId) {
  const inv = await RPGInventory.findAll({ where: { userId } });
  return inv.map(i => i.item);
}

// Remover item da loja RPG
export async function removeRPGShopItem(itemName) {
  const item = await RPGShop.findByPk(itemName);
  if (!item) return false;
  await item.destroy();
  return true;
}