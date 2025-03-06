export const defaultFormFields = [
  {
    name: {
      es: 'Nombre',
      en: 'Name',
    },
    slug: 'name',
    placeholder: {
      es: '',
      en: '',
    },
    defaultValue: {
      es: '',
      en: '',
    },
    required: true,
    hasConfirmation: false,
    type: 'text',
    options: [],
  },
  {
    required: true,
    defaultValue: {
      en: '',
      es: '',
    },
    options: [],
    hasConfirmation: true,
    name: {
      en: 'Email',
      es: 'Email',
    },
    placeholder: {
      es: '',
      en: '',
    },
    type: 'email',
    slug: 'email',
  },
  {
    placeholder: {
      es: '',
      en: '',
    },
    defaultValue: {
      es: '',
      en: '',
    },
    required: true,
    name: {
      en: 'Phone',
      es: 'Celular',
    },
    type: 'number',
    hasConfirmation: false,
    options: [],
    slug: 'phone',
  },
  {
    name: {
      es: '¿Celebras algo especial?',
      en: 'Do you celebrate something special?*',
    },
    slug: 'doYouCelebrateSomethingSpecial',
    placeholder: {
      es: '',
      en: '',
    },
    defaultValue: {
      es: '',
      en: '',
    },
    required: true,
    hasConfirmation: false,
    type: 'select',
    options: [
      {
        id: 'otroMotivo',
        value: {
          es: 'Otro motivo',
          en: 'Another',
        },
      },
      {
        id: 'despedida',
        value: {
          es: 'Despedida',
          en: 'Farewell',
        },
      },
      {
        id: 'cumpleaos',
        value: {
          es: 'Cumpleaños',
          en: 'Birthday',
        },
      },
      {
        id: 'graduacin',
        value: {
          es: 'Graduación',
          en: 'Graduation',
        },
      },
      {
        id: 'citaDeAmigos',
        value: {
          es: 'Cita de amigos',
          en: 'Event with friends',
        },
      },
      {
        id: 'aniversario',
        value: {
          es: 'Aniversario',
          en: 'Anniversary',
        },
      },
      {
        id: 'negocios',
        value: {
          es: 'Negocios',
          en: 'Business',
        },
      },
      {
        id: 'citaRomantica',
        value: {
          es: 'Cita Romantica',
          en: 'Romantic Date',
        },
      },
      {
        id: 'bienvenida',
        value: {
          es: 'Bienvenida',
          en: 'Welcome',
        },
      },
    ],
  },
  {
    required: true,
    hasConfirmation: false,
    name: {
      en: 'Number of pets *',
      es: 'Número de mascotas',
    },
    type: 'select',
    slug: 'numberOfPets',
    options: [
      {
        value: {
          en: '1',
          es: '1',
        },
        id: '1',
      },
      {
        value: {
          en: '2',
          es: '2',
        },
        id: '2',
      },
      {
        value: {
          en: '3',
          es: '3',
        },
        id: '3',
      },
      {
        value: {
          en: '4',
          es: '4',
        },
        id: '4',
      },
      {
        id: '5',
        value: {
          en: '5',
          es: '5',
        },
      },
    ],
    defaultValue: {
      en: '',
      es: '',
    },
    placeholder: {
      es: '',
      en: '',
    },
  },
];
