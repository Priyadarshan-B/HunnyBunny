const { post_database, get_database } = require("../../config/db_utils");

exports.update_stock = async (product_name, product_quantity) => {
  // console.log("Updating stock for:", product_name, product_quantity);

  if (!product_name || !product_quantity) {
    throw new Error("All fields are required");
  }
  const checkQuery = `
    SELECT id, product_quantity FROM qr_products 
    WHERE product_name = ? AND status = ?
    LIMIT 1
  `;
  const checkParams = [product_name, "1"];
  const checkResult = await get_database(checkQuery, checkParams);
  // console.log("Check Result:", checkResult.result);

  if (checkResult.length > 0) {
    const existingQuantity = parseInt(checkResult[0].product_quantity);
    console.log("Existing Quantity:", existingQuantity);
    const newQuantity = existingQuantity - parseInt(product_quantity);

    if (newQuantity < 0) {
      throw new Error(`Insufficient stock for product: ${product_name}`);
    }

    const updateQuery = `
      UPDATE qr_products 
      SET product_quantity = ?
      WHERE product_name = ? AND status = ?
    `;
    const updateParams = [newQuantity, product_name, "1"];
    await post_database(updateQuery, updateParams);

    return { message: "Stock updated successfully" };
  } else {
    throw new Error(`Product not found: ${product_name}`);
  }
};
