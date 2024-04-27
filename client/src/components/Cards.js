import React from 'react';
import './Cards.css';
import CardItem from './CardItem';

function Cards() {
  return (
    <div className='cards'>
      <h1>Book tickets to EPIC Destinations!</h1>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='images/tickets.jpg'
              text='Book Tickets'
              label='Amazing Discounts'
              path='/services'
            />
            <CardItem
              src='images/airport.webp'
              text='Easy Web Check-in'
              label='Avoid long ques'
              path='/services'
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='images/hotels.jpg'
              text='Book Luxurious hotels at an interesting price'
              label='Enjoy Luxury'
              path='/services'
            />
            <CardItem
              src='images/cabs.webp'
              text='pre-book your cabs from the airport'
              label='Travel made easy'
              path='/products'
            />
            <CardItem
              src='images/img-8.jpg'
              text='Ride through the Sahara Desert on a guided camel tour through'
              label='Enjoy Holiday Packages'
              path='/sign-up'
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Cards;
