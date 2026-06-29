import { useState } from 'react'
import { Navigate } from 'react-router'
import { Flex, Modal, Button } from '@mantine/core'
import { Carousel } from '@mantine/carousel'

function Results({}) {
  const [opened, setOpened] = useState(true)

  return <Modal opened={opened} withCloseButton={false} onClose={() => {}}>
    <Flex direction="column" gap="lg">
      <Carousel
        withIndicators
        withControls
        height={300}
        slideGap="md"
        controlsOffset="sm"
      >
        <Carousel.Slide bg="red">1</Carousel.Slide>
        <Carousel.Slide bg="yellow">2</Carousel.Slide>
        <Carousel.Slide bg="blue">3</Carousel.Slide>
      </Carousel>
      <Flex justify="space-around">
        <Button onClick={() => setOpened(false)} color="green">Skip tutorial</Button>
      </Flex>
    </Flex>
  </Modal>
}

export default Results