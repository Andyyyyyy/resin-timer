import { Center, forwardRef } from '@chakra-ui/react';
import { motion, isValidMotionProp } from 'framer-motion';

// A custom motion component from Box
export const AppBox = motion.custom(
  forwardRef((props, ref) => {
    const chakraProps = Object.fromEntries(
      // do not pass framer props to DOM element
      Object.entries(props).filter(([key]) => !isValidMotionProp(key))
    );
    return <Center ref={ref} {...chakraProps} />;
  })
);

export const Animated = motion.custom(
  forwardRef((props, ref) => {
    const chakraProps = Object.fromEntries(
      // do not pass framer props to DOM element
      Object.entries(props).filter(([key]) => !isValidMotionProp(key))
    );
    return <div ref={ref} {...chakraProps} />;
  })
);
