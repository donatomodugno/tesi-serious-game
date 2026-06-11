import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { Flex, Box, Modal, Title, Text, Button, ScrollArea } from '@mantine/core'
import { Icon } from '../icons'
import API from '../API'

function ModalDelete({opened, close, confirm}) {
    return <Modal
        opened={opened}
        onClose={close}
        title={
            <Flex align="center" gap="sm">
                <Icon.Delete color="red"/>
                <Text span fw="700">Delete exercise</Text>
            </Flex>
        }
        overlayProps={{
            backgroundOpacity: 0.5,
            blur: 3,
        }}
        transitionProps={{transition: 'pop-top-left'}}
        size="xs"
        centered
    >
        <Flex direction="column">
            <Text c="red" fw="bold">{opened?.name || 'Exercise'}</Text>
            <Text>Are you sure to delete this exercise?</Text>
        </Flex>
        <Flex justify="flex-end" gap="md" mt="xl">
            <Button color="gray" onClick={close}>Cancel</Button>
            <Button color="red" onClick={confirm}>Delete</Button>
        </Flex>
    </Modal>
}

function Exercises({logged=true}) {
    const [newId, setNewId] = useState(null)
    const [exerciseToDelete, setExerciseToDelete] = useState(null)
    const [exercises, setExercises] = useState([])

    const loadExercises = async () => {
        // setExercises((await API.getExercises()).map(ex => ({...ex, title: ex.name})))
        // setExercises((await API.getExercises()).map(({id, name}) => ({id, title: name})))
        setExercises(await API.getExercises())
    }

    const newExercise = async () => {
        setNewId(await API.createExercise({name: 'Exercise'}))
    }

    const deleteExercise = async (ex) => {
        await API.deleteExercise(ex)
        loadExercises()
    }

    useEffect(() => {
        loadExercises()
    }, [])

    return <>
        {newId && <Navigate to={"/edit/"+newId}/>}
        <ModalDelete
            opened={exerciseToDelete}
            close={() => setExerciseToDelete()}
            confirm={() => {
                deleteExercise(exerciseToDelete)
                setExerciseToDelete()
            }}
        />
        <Flex h="90%" justify="flex-start" gap="sm" direction="column" align="center">
            {/* <span>
                <button onClick={() => console.log(exercises)}>logExercise</button>
                <button>editExercise</button>
                <button>deleteExercise</button>
            </span> */}
            <Title mt="2.75rem">BPMN BattleCards</Title>
            <Title order={3}>Choose an exercise {logged && <>
                or <Button color="green" onClick={newExercise}>Create a new exercise</Button>
            </>}</Title>
            <ScrollArea.Autosize h="70%" w="80%" type="always" scrollbars="y" id="exercises-list">
                {exercises.map((ex, k) => <Flex
                    key={k}
                    w="95%" // Wanted to achieve this using "offsetScrollbars" but it wasn't working properly
                    className="exercise-item"
                    align="center"
                    justify="space-between"
                    style={{backgroundColor:'hsl('+(180+k*30)+' 100 90)'}}
                >
                    {logged && <span>
                        <Link to={"/edit/"+ex.id}>
                            <Button
                                color="green"
                                leftSection={<Icon.Edit color="white"/>}
                            >Edit</Button>
                        </Link>
                        <Button
                            ml="10"
                            color="red"
                            onClick={() => setExerciseToDelete(ex)}
                            leftSection={<Icon.Delete color="white"/>}
                        >Delete</Button>
                    </span>}
                    <Text size="lg">{ex.name}</Text>
                    <Link to={"/play/"+k}>
                        <Button color="green" size="lg">Play game!</Button>
                    </Link>
                </Flex>)}
                <Text ta="center" c="grey" mt="60" mb="100">That's all for now</Text>
            </ScrollArea.Autosize>
        </Flex>
    </>
}

export default Exercises