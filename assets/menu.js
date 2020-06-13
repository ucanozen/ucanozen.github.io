module.exports = {
  Drinks: [
    {
      type: 'hot drinks',
      sizes: ['12oz', '16oz'],
      drinks: [
        {
          drinkType: 'coffee',
          varities: [
            {
              name: 'freshly brewed coffee',
              price1: '$2.00',
              price2: '$2.25',
            },
            {
              name: 'café au lait',
              price1: '$2.50',
              price2: '$2.75',
            },
            {
              name: 'french press for two',
              price1: '$5.75 ',
              price2: '',
            },
          ],
        },
        {
          drinkType: 'espresso',
          varities: [
            {
              name: 'americano',
              price1: '$2.90',
              price2: '$3.00',
            },
            {
              name: 'africano',
              price1: '$3.15',
              price2: '$3.50',
            },
            {
              name: 'cappuccino',
              price1: '$4.00',
              price2: '$4.25',
            },
            {
              name: 'latte',
              price1: '$4.00',
              price2: '$4.25',
            },
            {
              name: 'vanilla latte',
              price1: '$4.50',
              price2: '$4.75',
            },
            {
              name: 'mocha latte',
              price1: '$4.50',
              price2: '$4.75',
            },
            {
              name: 'caramel latte',
              price1: '$4.50',
              price2: '$4.75',
            },
            {
              name: 'shot in the dark ',
              price1: '$3.25',
              price2: '$3.50',
            },
            {
              name: 'espresso ',
              price1: '$2.25',
              price2: '$2.50',
            },
            {
              name: 'espresso macchiato',
              price1: '$2.50',
              price2: '$2.75',
            },
          ],
        },
        {
          drinkType: 'alternatives',
          varities: [
            {
              name: 'chai latte',
              price1: '$4.00',
              price2: '$4.50',
            },
            {
              name: 'matcha latte',
              price1: '$4.50',
              price2: '$4.75',
            },
            {
              name: 'london fog',
              price1: '$4.50',
              price2: '$4.75',
            },
            {
              name: 'steamed milk',
              price1: '$3.00',
              price2: '$3.25',
            },
            {
              name: 'hot chocolate ',
              price1: '$3.50',
              price2: '$3.75',
            },
            {
              name: 'hot apple cider',
              price1: '$3.25',
              price2: '$3.50',
            },
            {
              name: 'tea',
              price1: '$2.25 ',
              price2: '$2.25',
            },
            {
              name: 'kids hot chocolate',
              price1: '$2.25',
              price2: '',
            },
            {
              name: 'kids steamer',
              price1: '$1.75',
              price2: '',
            },
          ],
        },
        {
          drinkType: 'extras',
          varities: [
            {
              name: 'espresso',
              price1: '0.50',
              price2: '',
            },
            {
              name: 'soy milk',
              price1: '0.50',
              price2: '',
            },
            {
              name: 'flavoured syrup',
              price1: '0.50',
              price2: '',
            },
          ],
        },
      ],
    },
    {
      type: 'cold drinks',
      sizes: ['16oz', ''],
      drinks: [
        {
          drinkType: 'iced',
          varities: [
            {
              name: 'iced coffee',
              price1: '$3.25',
              price2: '',
            },
            {
              name: 'iced latte',
              price1: '$4.50',
              price2: '',
            },
            {
              name: 'iced vanilla latte',
              price1: '$4.75',
              price2: '',
            },
            {
              name: 'iced mocha',
              price1: '$4.75',
              price2: '',
            },
            {
              name: 'iced chai latte',
              price1: '$4.75',
              price2: '',
            },
            {
              name: 'iced matcha',
              price1: '$4.75',
              price2: '',
            },
          ],
        },
        {
          drinkType: 'blended',
          varities: [
            {
              name: 'mocha frappe',
              price1: '$4.75',
              price2: '',
            },
            {
              name: 'chai frappe ',
              price1: '$4.75',
              price2: '',
            },
            {
              name: 'matcha frappe',
              price1: '$4.75',
              price2: '',
            },
            {
              name: 'fruit smoothie',
              price1: '$4.75',
              price2: '',
            },
          ],
        },
      ],
    },
  ],
  Food: [
    {
      type: 'lunch items',
      sizes: ['small', 'big'],
      foods: [
        {
          foodType: 'soup',
          varities: [
            {
              name: 'Soup of the day',
              price1: '$4.75',
              price2: '$6.75',
            },
          ],
        },
        {
          foodType: 'salads',
          varities: [
            {
              name: 'Coming Soon',
              price1: '',
              price2: '',
              ingredients: '',
            },
          ],
        },
        {
          foodType: 'rolls',
          varities: [
            {
              name: 'sausage roll',
              price1: '',
              price2: '$3.00',
            },
            {
              name: 'veggie roll',
              price1: '',
              price2: '$3.00',
            },
          ],
        },
        {
          foodType: 'paninis',
          varities: [
            {
              name: 'haultain heat ',
              price1: '',
              price2: '$7.75',
              ingredients:
                'Turkey, spicy salami, banana peppers, havarti cheese, spinach, chipotle mayo',
            },
            {
              name: 'little piggy ',
              price1: '',
              price2: '$7.75',
              ingredients:
                'Black forest ham, capicolli ham, havarti cheese, spinach, roasted red pepper sauce',
            },
            {
              name: 'garden lover ',
              price1: '',
              price2: '$7.75',
              ingredients:
                'Zucchini, peppers, sun dried tomato, avacodo, spinach, havarti cheese, roasted red pepper sauce',
            },
            {
              name: 'finding nemo ',
              price1: '',
              price2: '$7.75',
              ingredients:
                'Tuna, peppers, zucchini, spinach, havarti cheese, mayo',
            },
            {
              name: 'chickadee ',
              price1: '',
              price2: '$7.75',
              ingredients:
                'Chicken, mozzarella, sun dried tomato, spinach, pesto mayo',
            },
          ],
        },
        {
          foodType: 'croissant sandwiches',
          varities: [
            {
              name: 'spicy salami',
              price1: '',
              price2: '$5.00',
            },
            {
              name: 'capicolli',
              price1: '',
              price2: '$5.00',
            },
            {
              name: 'black forest ham',
              price1: '',
              price2: '$5.00',
            },
            {
              name: 'turkey',
              price1: '',
              price2: '$5.00',
            },
          ],
        },
        {
          foodType: 'breakfast sandwiches',
          varities: [
            {
              name: 'spicy salami',
              price1: '',
              price2: '$4.25',
            },
            {
              name: 'capicolli',
              price1: '',
              price2: '$4.25',
            },
            {
              name: 'black forest ham',
              price1: '',
              price2: '$4.25',
            },
            {
              name: 'turkey',
              price1: '',
              price2: '$4.25',
            },
            {
              name: 'vegetarian',
              price1: '',
              price2: '$4.25',
            },
          ],
        },
      ],
    },
  ],
};
