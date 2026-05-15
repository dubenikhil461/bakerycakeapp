export type CakeItem = {
  name: string
  price: number
}

export type CatalogCategory = {
  id: string
  icon: string
  title: string
  subtitle: string
  items: CakeItem[]
}

export const catalogCategories: CatalogCategory[] = [
  {
    id: 'fruit-delight',
    icon: '🍓',
    title: 'Fruit Delight',
    subtitle: 'Half KG — Starting ₹400',
    items: [
      { name: 'Black Forest Cake', price: 400 },
      { name: 'Blue Berry Cake', price: 450 },
      { name: 'Blue Lagoon Cake', price: 400 },
      { name: 'Kiwi Cake', price: 450 },
      { name: 'Mixed Fruit 500', price: 500 },
      { name: 'Pineapple Cake', price: 400 },
      { name: 'Strawberry Cake', price: 400 },
      { name: 'Very Berry Fruit Cake', price: 500 },
      { name: 'White Forest Cake', price: 400 },
    ],
  },
  {
    id: 'cream-chocolate',
    icon: '🍫',
    title: 'Cream Chocolate',
    subtitle: 'Half KG — Starting ₹450',
    items: [
      { name: 'Cream Chocolate', price: 450 },
      { name: 'Chocolate With Coffee', price: 450 },
      { name: 'Chocolate Nutella Flavour', price: 500 },
      { name: 'Chocolate Peanut Butter', price: 500 },
      { name: 'Dutch Chocolate Cake', price: 500 },
      { name: 'Dutch Choco Walnut', price: 600 },
      { name: 'Dutch Choco Almond', price: 550 },
      { name: 'Dalgona Coffee Flavour', price: 500 },
    ],
  },
  {
    id: 'fusion-flavours',
    icon: '🎯',
    title: 'Fusion Flavours',
    subtitle: 'Half KG — Starting ₹500',
    items: [
      { name: 'Amrakhand Cake', price: 500 },
      { name: 'Gulabjam Ladoo Cake', price: 650 },
      { name: 'Kalakand Cake', price: 650 },
      { name: 'Motichoor Cake', price: 500 },
      { name: 'Rasmalai Cake', price: 500 },
      { name: 'Rasmalai Rabdi Cake', price: 550 },
    ],
  },
]
