import React from 'react';

export const DEFAULT_CARD_STATE = {
    cardNumber: '"#### #### #### ####',
    cardHolder: 'FULL NAME',
    cardMonth: '',
    cardYear: '',
    cardCVV: '',
    isFlipped: false,
    currentFocusedElm: null,
};

export const cardContext = React.createContext(DEFAULT_CARD_STATE);



export const useCardState = () => {};
