import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';
const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });
  const findTimeleft = () => {
    const msLeft = new Date(order.expiresAt) - new Date();
    setTimeLeft(Math.round(msLeft / 1000));
  };
  useEffect(() => {
    //Updates time left right away
    findTimeleft();
    //An then update time every 1 seconds
    const timerId = setInterval(findTimeleft, 1000);
    //function evoke if we navigate away from the componenent or if the componenent is
    // re-rendered (if a dependency is listed in the array)
    return () => {
      clearInterval(timerId);
    };
  }, [order]);
  if (timeLeft < 0) {
    return <div>Order expired.</div>;
  }
  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => {
          doRequest({ token: id });
        }}
        amount={order.ticket.price * 100}
        stripeKey="pk_test_zmCGZnOtmpF6MFK1Dwxo0GNE"
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};
export default OrderShow;
