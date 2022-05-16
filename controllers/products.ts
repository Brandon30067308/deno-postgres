import { Client } from "https://deno.land/x/postgres/mod.ts";
import { dbCreds } from "../config.ts";
import Product from "../types.ts";

// Init client
const client = new Client(dbCreds);

// utils
const getProductById = async (
  id: string
): Promise<{
  success: boolean;
  result: Product | string;
}> => {
  const result = await client.queryArray(
    `SELECT * FROM products WHERE id=${id}`
  );

  const product: any = {};

  result.rows.map((p) => {
    result.rowDescription?.columns.map((column, i) => {
      product[column.name] = p[i];
    });
  });

  if (result?.rows?.length === 0) {
    return {
      success: false,
      result: `no product found with id of ${id}`,
    };
  } else {
    return {
      success: true,
      result: product,
    };
  }
};

const getProduct = async ({
  params,
  response,
}: {
  params: { id: string };
  response: any;
}) => {
  try {
    await client.connect();
    const { result, success } = await getProductById(params.id);

    response.status = success ? 200 : 404;
    response.body = {
      success: success,
      data: result,
    };
  } catch (err) {
    console.log("error: ", err);
    response.status = 500;
    response.body = {
      success: false,
      msg: err.message,
    };
  } finally {
    client.end();
  }
};

const getProducts = async ({ response }: { request: any; response: any }) => {
  try {
    await client.connect();

    const result = await client.queryObject("SELECT * FROM products");

    const products = result?.rows;

    response.status = 200;
    response.body = {
      success: true,
      data: products,
    };
  } catch (err) {
    console.log("error: ", err);
    response.status = 500;
    response.data = {
      success: false,
      msg: err.message,
    };
  } finally {
    client.end();
  }
};

const addProduct = async ({
  request,
  response,
}: {
  request: any;
  response: any;
}) => {
  const body = await request.body();
  const product = await body.value;

  if (!request.hasBody) {
    response.body = {
      success: false,
      msg: "no data",
    };
  } else {
    try {
      await client.connect();

      await client.queryArray(
        `INSERT INTO products(name,description,price) VALUES('${product.name}','${product.description}','${product.price}')`
      );

      response.body = {
        success: true,
        product: product,
      };
      response.status = 201;
    } catch (err) {
      console.log("error: ", err);
      response.status = 500;
      response.message = {
        success: false,
        msg: err.message,
      };
    } finally {
      client.end();
    }
  }
};

const updateProduct = async ({
  params: { id },
  request,
  response,
}: {
  params: { id: string };
  request: any;
  response: any;
}) => {
  await client.connect();

  const { result, success } = await getProductById(id);

  if (!success) {
    response.status = 404;
    response.body = {
      success: false,
      msg: result,
    };
  } else {
    const body = await request.body();
    const product = await body.value;

    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        body: "no data",
      };
      return;
    }

    try {
      await client.queryArray(
        `UPDATE products SET name='${product.name}', description='${product.description}', price='${product.price}' WHERE id='${id}'`
      );

      response.status = 200;
      response.body = {
        success: true,
        data: product,
      };
    } catch (err) {
      console.log("error: ", err);
      response.status = 500;
      response.body = {
        success: false,
        msg: err.message,
      };
    } finally {
      client.end();
    }
  }
};

const deleteProduct = async ({
  params: { id },
  response,
}: {
  params: { id: string };
  response: any;
}) => {
  await client.connect();

  const { result, success } = await getProductById(id);

  if (!success) {
    response.status = 404;
    response.body = {
      success: success,
      msg: result,
    };
  } else {
    try {
      await client.queryArray(`DELETE FROM products WHERE id='${id}'`);

      response.status = 200;
      response.body = {
        success: true,
        msg: `product with id ${id} has been deleted`,
      };
    } catch (err) {
      console.log("error: ", err);
      response.status = 500;
    } finally {
      client.end();
    }
  }
};

export { getProduct, getProducts, addProduct, updateProduct, deleteProduct };
