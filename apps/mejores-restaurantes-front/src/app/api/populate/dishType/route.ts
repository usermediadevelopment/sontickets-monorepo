// populate dish type

import { NextResponse } from "next/server";
import { sanityClient } from "@/config/client";
import { DishType } from "@/types/sanity";

export async function GET() {
  const dishTypes: Partial<DishType>[] = [
    {
      _type: "dishType",
      name: "Pasta",
      description:
        "La pasta es un plato italiano que se compone de pasta y salsa.",
      slug: { _type: "slug", current: "pasta" },
    },
    {
      _type: "dishType",
      name: "Pizza",
      description:
        "La pizza es un plato italiano que se compone de pizza y salsa.",
      slug: { _type: "slug", current: "pizza" },
    },
    {
      _type: "dishType",
      name: "Hamburguesas",
      description:
        "La hamburguesa es un plato estadounidense que se compone de hamburguesa y salsa.",
      slug: { _type: "slug", current: "hamburguesas" },
    },
    {
      _type: "dishType",
      name: "Sushi",
      description:
        "El sushi es un plato japonés que se compone de sushi y salsa.",
      slug: { _type: "slug", current: "sushi" },
    },
    {
      _type: "dishType",
      name: "Tacos",
      description:
        "El taco es un plato mexicano que se compone de taco y salsa.",
      slug: { _type: "slug", current: "tacos" },
    },
    {
      _type: "dishType",
      name: "Ensaladas",
      description:
        "La ensalada es un plato vegetariano que se compone de ensalada y salsa.",
      slug: { _type: "slug", current: "ensaladas" },
    },
    {
      _type: "dishType",
      name: "Sopas",
      description:
        "La sopa es un plato caliente que se compone de sopa y salsa.",
      slug: { _type: "slug", current: "sopas" },
    },
    {
      _type: "dishType",
      name: "Mariscos",
      description:
        "Los mariscos son un plato de marisco que se compone de marisco y salsa.",
      slug: { _type: "slug", current: "mariscos" },
    },
    {
      _type: "dishType",
      name: "Carnes",
      description:
        "Las carnes son un plato de carne que se compone de carne y salsa.",
      slug: { _type: "slug", current: "carnes" },
    },
    {
      _type: "dishType",
      name: "Pollo",
      description:
        "El pollo es un plato de pollo que se compone de pollo y salsa.",
      slug: { _type: "slug", current: "pollo" },
    },
    {
      _type: "dishType",
      name: "Pescado",
      description:
        "El pescado es un plato de pescado que se compone de pescado y salsa.",
      slug: { _type: "slug", current: "pescado" },
    },
    {
      _type: "dishType",
      name: "Postres",
      description:
        "Los postres son un plato dulce que se compone de postre y salsa.",
      slug: { _type: "slug", current: "postres" },
    },
    {
      _type: "dishType",
      name: "Desayunos",
      description:
        "Los desayunos son un plato caliente que se compone de desayuno y salsa.",
      slug: { _type: "slug", current: "desayunos" },
    },
    {
      _type: "dishType",
      name: "Bebidas",
      description:
        "Las bebidas son un plato dulce que se compone de bebida y salsa.",
      slug: { _type: "slug", current: "bebidas" },
    },
    {
      _type: "dishType",
      name: "Parrilla",
      description:
        "La parrilla es un plato de carne que se compone de carne y salsa.",
      slug: { _type: "slug", current: "parrilla" },
    },
    {
      _type: "dishType",
      name: "Sándwiches",
      description:
        "Los sándwiches son un plato de sándwich que se compone de sándwich y salsa.",
      slug: { _type: "slug", current: "sandwiches" },
    },
    {
      _type: "dishType",
      name: "Comida Rápida",
      description:
        "La comida rápida es un plato de comida rápida que se compone de comida rápida y salsa.",
      slug: { _type: "slug", current: "comida-rapida" },
    },
    {
      _type: "dishType",
      name: "Comida Vegetariana",
      description:
        "La comida vegetariana es un plato de comida vegetariana que se compone de comida vegetariana y salsa.",
      slug: { _type: "slug", current: "comida-vegetariana" },
    },
    {
      _type: "dishType",
      name: "Comida Vegana",
      description:
        "La comida vegana es un plato de comida vegana que se compone de comida vegana y salsa.",
      slug: { _type: "slug", current: "comida-vegana" },
    },
    {
      _type: "dishType",
      name: "Comida Internacional",
      description:
        "La comida internacional es un plato de comida internacional que se compone de comida internacional y salsa.",
      slug: { _type: "slug", current: "comida-internacional" },
    },
  ];

  try {
    const transaction = sanityClient.transaction();
    dishTypes.forEach((dishType) => {
      transaction.create(dishType as DishType);
    });
    await transaction.commit();
  } catch (error) {
    console.error("Error creating dish types:", error);
    return NextResponse.json(
      { error: "Failed to create dish types" },
      { status: 500 }
    );
  }
  return NextResponse.json(dishTypes);
}
