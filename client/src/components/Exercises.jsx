import { useState } from 'react'
import { Link } from 'react-router'
import { Flex, Box, Title, Text, Button, ScrollArea, Space } from '@mantine/core'
import API from '../API'

function Exercises({logged=true}) {
    const [exercises, setExercises] = useState([
        'Car rental',
        'Hotel reservations',
        'Car rental',
        'Hotel reservations',
        'Car rental',
        'Hotel reservations',
    ])

    return <>
        <Flex h="90%" justify="flex-start" gap="sm" direction="column" align="center">
            <Space h="xl"/>
            <Title>BPMN BattleCards</Title>
            <Title order={3}>Choose an exercise</Title>
            <ScrollArea.Autosize h="70%" w="80%" type="always" scrollbars="y" style={{borderBottom:'1px solid lightgrey'}}>
                {exercises.map((e, k) => <Flex
                    key={k}
                    w="95%" // Wanted to achieve this using "offsetScrollbars" but it wasn't working properly
                    style={{margin:'20px', padding:'20px', boxShadow: '2px 2px 5px 2px lightgrey', borderRadius:'20px'}}
                    align="center"
                    justify="space-between"
                >
                    {logged && <span>
                        <Link to={"/edit/"+k}>
                            <Button color="yellow">Edit</Button>
                        </Link>
                        {' '}
                        <Button color="red">Delete</Button>
                    </span>}
                    <Text size="lg">{e}</Text>
                    <Link to={"/play/"+k}>
                        <Button color="green" size="lg">Play game!</Button>
                    </Link>
                </Flex>)}
                <Space h="xl"/>
                <Text ta="center" c="grey">That's all for now</Text>
                <Space h="100"/>
            </ScrollArea.Autosize>
        </Flex>
    </>
}

export default Exercises