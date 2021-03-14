/* It's mostly all in one file because I'm lazy */
import React, { useEffect, useState } from 'react';
import {
  ChakraProvider,
  Flex,
  extendTheme,
  chakra,
  Text,
  Heading,
  Editable,
  EditablePreview,
  EditableInput,
  Tooltip,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Link,
  VStack,
} from '@chakra-ui/react';
import { Animated, AppBox } from './MotionBox';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import useInterval from './useInterval';
import usePageVisibility from './usePageVisibility';

const theme = extendTheme({
  fonts: {
    body: 'ArbutusSlab',
    heading: 'ArbutusSlab',
  },
});

const resinRefillTime = 8; //minutes

const maxResin = 160;

const numReg = /^(\d){0,3}$/;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.4,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    duration: 1,
  },
};

//thx stackoverflow
const msToTime = s => {
  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }
  const ms = s % 1000;
  s = (s - ms) / 1000;
  const secs = s % 60;
  s = (s - secs) / 60;
  const mins = s % 60;
  const hrs = (s - mins) / 60;

  return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
};

const inputToNumber = input => {
  if (input === '') return 0;
  input = parseInt(input);
  if (input > maxResin) {
    return maxResin;
  } else {
    return input;
  }
};

const formatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

function App() {
  const [currentResin, setCurrentResin] = useState(maxResin);
  const [rechargedDate, setRechargedDate] = useState(0);
  const [rechargedDateString, setRechargedDateString] = useState('');
  const [delta, setDelta] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const isPageVisible = usePageVisibility();

  const onChangeResin = nextValue => {
    if (numReg.test(nextValue)) {
      const resin = inputToNumber(nextValue);
      setCurrentResin(resin);
    }
  };

  const onSubmitResin = nextValue => {
    const resinValue = inputToNumber(nextValue);

    setCurrentResin(resinValue);
    const now = new Date();
    const resinDelta = maxResin - resinValue;
    const remainingTime = 1000 * 60 * resinDelta * resinRefillTime; //milliseconds
    const rechargedDate = now.getTime() + remainingTime;
    setRechargedDate(rechargedDate);
    localStorage.setItem('rechargedDate', rechargedDate.toString());

    setIsEditing(false);
  };

  const subtractResin = () => {
    if (currentResin >= 20) {
      let newRechargedDate;
      if (delta <= 0) {
        const now = new Date();
        newRechargedDate = now.getTime() + 20 * resinRefillTime * 60 * 1000;
      } else {
        newRechargedDate = rechargedDate + 20 * resinRefillTime * 60 * 1000;
      }
      setRechargedDate(newRechargedDate);
      localStorage.setItem('rechargedDate', newRechargedDate.toString());
    }
  };

  const calculateDelta = rechargedDate => {
    const now = new Date();
    const deltaTime = rechargedDate - now.getTime();
    if (deltaTime > 0) {
      let resinDelta = deltaTime / (resinRefillTime * 60 * 1000);
      resinDelta = Math.ceil(resinDelta);
      setCurrentResin(maxResin - resinDelta);
      setDelta(deltaTime);
    } else {
      setCurrentResin(maxResin);
    }
  };

  //calculate data on startup
  useEffect(() => {
    let rechargedDate = localStorage.getItem('rechargedDate');
    rechargedDate = parseInt(rechargedDate);
    if (!isNaN(rechargedDate)) {
      setRechargedDate(rechargedDate);
      calculateDelta(rechargedDate);
    }
  }, []);

  //calculate delta when rechargedDate changes
  useEffect(() => {
    if (rechargedDate > 0) {
      const now = new Date();
      setDelta(rechargedDate - now.getTime());
    }
  }, [rechargedDate]);

  useEffect(() => {
    setTimeout(() => {
      if (!localStorage.getItem('rechargedDate')) {
        setTooltipOpen(true);
      }
    }, 2000);
  }, []);

  // refresh timer when page becomes visible again
  useEffect(() => {
    if (isPageVisible) {
      calculateDelta(rechargedDate);
      setRechargedDateString(
        new Date(rechargedDate).toLocaleTimeString([], formatOptions)
      );
    }
  }, [isPageVisible, rechargedDate]);

  //delta countdown
  useInterval(() => {
    if (!isPageVisible) return;

    if (delta > 0) {
      const newDelta = delta - 1000;
      let resinDelta = newDelta / (resinRefillTime * 60 * 1000);
      resinDelta = Math.ceil(resinDelta);
      if (!isEditing) {
        setDelta(newDelta);
        setCurrentResin(maxResin - resinDelta);
      }
    } else {
      if (!isEditing) {
        setDelta(0);
        setCurrentResin(maxResin);
      }
    }
  }, 1000);

  return (
    <ChakraProvider theme={theme}>
      <AppBox
        initial="hidden"
        animate="show"
        variants={container}
        textAlign="center"
        height="100vh"
        bgGradient="linear(to-b, #20242F, #2c202f)"
        flexDir="column"
        opacity="0"
      >
        <Animated variants={item}>
          <Heading color="#D2BC93" m={8} size="lg">
            How's my resin doing?
          </Heading>
        </Animated>

        <Animated variants={item}>
          <Flex
            alignItems="center"
            background="#0000002e"
            borderRadius="30px"
            pr={2}
            pl={2}
            color="#FFFFFF"
            border="solid #ffffff1f 3px"
            mb={4}
            boxShadow="inset #0a0d13 0px 0px 4px 0px"
          >
            <chakra.img src="resin.png" w="60px" mr={1} />
            <Flex fontSize="2.5rem" w="100%" alignItems="center">
              <Tooltip
                hasArrow
                label="Click here to set your resin"
                placement="top"
                isOpen={tooltipOpen}
                arrowSize={15}
                bg="gray.500"
              >
                <Editable
                  onMouseEnter={() => setTooltipOpen(true)}
                  onMouseLeave={() => setTooltipOpen(false)}
                  defaultValue={maxResin}
                  maxLength="3"
                  fontSize="2.5rem"
                  maxWidth="6rem"
                  pl="1"
                  pr="1"
                  textAlign="center"
                  borderRadius="4px"
                  transition="width 3s"
                  _hover={{
                    background: '#ffffff20',
                  }}
                  value={currentResin}
                  onChange={onChangeResin}
                  onSubmit={onSubmitResin}
                  onCancel={onSubmitResin}
                  onEdit={() => {
                    setIsEditing(true);
                  }}
                  selectAllOnFocus={!isEditing}
                  variant="unstyled"
                >
                  <EditablePreview />
                  <EditableInput />
                </Editable>
              </Tooltip>

              <Text>/</Text>

              <Text pl="1" pr="1" textAlign="center">
                {maxResin}
              </Text>

              <Button
                borderRadius="3xl"
                height="2.2rem"
                width="2.2rem"
                minWidth="0"
                p="0"
                bg="white"
                _hover={{
                  transform: 'scale(1.05)',
                  bg: '#D2BC93',
                }}
                _active={{
                  transform: 'scale(0.95)',
                  bg: '#D2BC93',
                }}
                color="gray.900"
                fontSize="1.8rem"
                ml={2}
                onClick={onModalOpen}
              >
                ?
              </Button>
            </Flex>
          </Flex>
        </Animated>

        <Animated variants={item}>
          <Flex
            background="#00000070"
            p={5}
            mb={4}
            fontSize="1.5rem"
            borderRadius={12}
            flexDir="column"
            alignItems="baseline"
          >
            <Text color="#D2BC93">Fully replenished in</Text>
            <Flex alignItems="baseline" justify="space-between" w="100%">
              <Text color="#FFFFFF">{msToTime(delta)}</Text>
              <Text color="#DDDDDD" fontSize="md">
                {delta > 0 && rechargedDateString}
              </Text>
            </Flex>
            <Button
              w="100%"
              colorScheme="blue"
              color="#D2BC93"
              mt="4"
              variant="outline"
              _hover={{ bg: '#D2BC9320' }}
              _active={{ bg: '#D2BC9330' }}
              onClick={subtractResin}
              disabled={currentResin < 20}
            >
              Subtract 20
            </Button>
          </Flex>
        </Animated>
      </AppBox>

      <Modal
        isOpen={isModalOpen}
        onClose={onModalClose}
        isCentered={true}
        size="xs"
      >
        <ModalOverlay />
        <ModalContent
          bgGradient="linear(to-br, #7BA1D2, #D5BE94)"
          borderRadius="xl"
        >
          <ModalHeader>Resin Timer for Genshin Impact</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack alignItems="baseline">
              <Text>
                Insert your current resin count and observe how your resin
                recharges over time and when it'll be full again.
              </Text>
              <Text>
                <chakra.span textShadow="#89BEF2 2px 2px 2px">
                  Your count is saved locally.
                </chakra.span>{' '}
                You can close this page and revisit it later to check back on
                your resin. You may add it to your bookmarks or homescreen for
                convenience.
              </Text>
              <Text>
                The sourcecode for this tool is on GitHub. Do whatever you want
                with the code.
              </Text>
              <Text>
                <Link
                  href="https://github.com/Andyyyyyy/resin-timer"
                  isExternal
                >
                  GitHub repository <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
              <Text>
                <Link href="https://twitter.com/awieandy" isExternal>
                  Twitter <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
              <Text>awieandy#4205</Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
}

export default App;
