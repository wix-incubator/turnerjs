import Counter from '../../components/Counter/Counter';
import {connect} from 'react-redux';
import {incrementCounter, decrementCounter} from '../../actions';

function mapStateToProps(state) {
  return {
    value: state.counter
  };
}

export default connect(mapStateToProps, {
  onIncrement: incrementCounter,
  onDecrement: decrementCounter
})(Counter);
