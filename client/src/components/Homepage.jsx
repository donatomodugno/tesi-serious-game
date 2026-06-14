import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { Flex, Box, Modal, Title, Text, Button, ScrollArea, Divider } from '@mantine/core'
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
            <Text c="red" fw="bold">{opened?.name || '...'}</Text>
            <Text>Are you sure to delete this exercise?</Text>
        </Flex>
        <Flex justify="flex-end" gap="md" mt="xl">
            <Button color="gray" onClick={close}>Cancel</Button>
            <Button color="red" onClick={confirm}>Delete</Button>
        </Flex>
    </Modal>
}

function Homepage({logged=true}) {
    const [newId, setNewId] = useState(null)
    const [exercises, setExercises] = useState([])
    const [exerciseToDelete, setExerciseToDelete] = useState(null)
    const [showGradients, setShowGradients] = useState({top: false, bottom: false})

    const loadExercises = async () => {
        setExercises(await API.getExercises())
    }

    const newExercise = async () => {
        setNewId(await API.createExercise({name: 'Exercise', turns: 24}))
    }

    const deleteExercise = async (ex) => {
        await API.deleteExercise(ex.id)
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
        <Flex h="92%" justify="flex-start" gap="sm" /* justify="end" */ direction="column" align="center">
            <Title mt="2.75rem">BPMN BattleCards</Title>
            <Title order={3}>Choose an exercise {logged && <>
                or <Button color="green" onClick={newExercise}>Create a new exercise</Button>
            </>}</Title>
            <ScrollArea.Autosize
                h="70%"
                mah="70%"
                w="80%"
                type="always"
                scrollbars="y"
                id="exercises-list"
                onOverflowChange={(value) => setShowGradients({top: false, bottom: value})}
                onTopReached={() => {setShowGradients({...showGradients, top: false})}}
                onBottomReached={() => {setShowGradients({...showGradients, bottom: false})}}
                onScrollPositionChange={() => {setShowGradients({top: true, bottom: true})}}
            >
                {exercises.map((ex, k) => <Flex
                    key={k}
                    w="95%" // Wanted to achieve this using "offsetScrollbars" but it wasn't working properly
                    className="exercise-item"
                    align="center"
                    justify="space-between"
                    gap="md"
                    style={{backgroundColor:'hsl('+/*(180+k*120)*//*120*/(180+k*30)+' 100 90)'}}
                >
                    {logged && <Flex direction="row">
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
                    </Flex>}
                    <Text fz={28} w="100%" ml="20">{ex.name}</Text>
                    <Link to={"/play/"+k}>
                        <Button color="green" size="lg" rightSection={<Icon.Play color="white"/>}>Play</Button>
                    </Link>
                </Flex>)}
                <Divider mt="100" mb="0" label={<Text c="grey">That's all for now</Text>} size="xl"/>
                <div className={'over-gradient bottom '+(showGradients.bottom ? '' : 'hide')}/>
                <div className={'over-gradient top '+(showGradients.top ? '' : 'hide')}/>
            </ScrollArea.Autosize>
            {/* <Flex style={{border:'1px solid #4444'}} w="100%" h="10%" align="center">
                <Text ml="40">Made by Donato Modugno, 2026</Text>
            </Flex> */}
        </Flex>
    </>
}

export default Homepage