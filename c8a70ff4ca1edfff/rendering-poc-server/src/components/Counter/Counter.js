import React, {PropTypes} from 'react';
import s from './Counter.scss';

const Counter = ({value, onIncrement, onDecrement}) => {
  return (
    <div>
      <p data-hook="counter-value" className={s.mainColor}>{value}</p>
      <button data-hook="increment-button" className="increment-button" onClick={onIncrement}>+</button>
      <button data-hook="decrement-button" className="decrement-button" onClick={onDecrement}>-</button>
    </div>
  );
};

Counter.propTypes = {
  value: PropTypes.number,
  onIncrement: PropTypes.func,
  onDecrement: PropTypes.func
};

export default Counter;
