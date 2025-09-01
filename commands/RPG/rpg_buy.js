import { buyRPGItem } from "../../utils/database.js";

export default {
  name: "rpg-buy",
  description: "Compra um item da loja RPG",
  async execute(message, args) {
    const itemName = args.join(" ");
    if (!itemName) return message.reply("❌ Use: `!buy <item>`");

    const result = await buyRPGItem(message.author.id, itemName);
    message.reply(result.message);
  },
};

