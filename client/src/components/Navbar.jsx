import { Flex, Button, Table, Title, Divider, Modal, TextInput, PasswordInput, Text } from '@mantine/core'
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Icon } from '../icons'
import API from '../API'

function ModalLogout({opened, close, logout}) {
    return <>
        <Modal
            opened={opened}
            onClose={close}
            withCloseButton={false}
            overlayProps={{
                backgroundOpacity: 0.5,
                blur: 3,
            }}
            transitionProps={{transition: 'slide-down'}}
            size="xs"
        >
            <Flex direction="column" gap="md">
                <Title order={4} ta="center">Are you sure to logout?</Title>
                <Flex justify="center" gap="md" mt="20">
                    <Button onClick={close} color="grey" variant="light">Cancel</Button>
                    <Button onClick={logout} color="green">Logout</Button>
                </Flex>
            </Flex>
        </Modal>
    </>
}

function ModalLogin({opened, close, login}) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    function checkPassword(password) {
        if(password.length>=4) return true
        return false
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setErrorMessage('')
        const credentials = {username, password}
        let valid = true
        if(username === '' || !checkPassword(password)) valid=false
        if(valid) {
            try {
                login(credentials)
            }
            catch(err) {
                console.log('here')
                setErrorMessage('Wrong username or password')
            }
        } else {
            setErrorMessage('Errors in the form')
        }
    }

    return <>
        {/* Ho usato i singoli children di Modal xkè unico modo per centrare il titolo */}
        <Modal.Root
            opened={opened}
            onClose={close}
            transitionProps={{transition: 'slide-down'}}
            size="xs"
        >
            <Modal.Overlay backgroundOpacity={0.5} blur={3}/>
            <Modal.Content>
                <Modal.Header>
                    <Modal.Title ta="center" w="100%" fz="xl" fw="bold">
                        Login
                    </Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body>
                    {/* Uso i <form> così posso loggarmi premendo invio sulla tastiera */}
                    <form onSubmit={handleSubmit}>
                        <Flex direction="column" gap="md">
                            <TextInput
                                leftSectionPointerEvents="none"
                                leftSection="📧"
                                label="Your email"
                                placeholder="Your email"
                                value={username}
                                onChange={(ev) => setUsername(ev.target.value)}
                                error={errorMessage!=''}
                            />
                            <PasswordInput
                                leftSectionPointerEvents="none"
                                leftSection="🔒"
                                label="Password"
                                placeholder="Password"
                                value={password}
                                onChange={(ev) => setPassword(ev.target.value)}
                                error={errorMessage!=''}
                            />
                            {errorMessage && <Text c="red">{errorMessage}</Text>}
                            <Flex justify="center" gap="md" mt="20">
                                <Button onClick={close} color="grey" variant="outline">Cancel</Button>
                                <Button type="submit" color="green">Login</Button>
                            </Flex>
                        </Flex>
                    </form>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    </>
}

function ModalScores({opened, close}) {
    const [results, setResults] = useState([])

    const load = async () => {
        setResults(await API.getResults())
    }

    useEffect(() => { load() }, [opened])

    return <>
        <Modal
            opened={opened}
            onClose={close}
            transitionProps={{transition: 'slide-down'}}
            centered
            size="xl"
            title="Leaderboard"
        >
            <Flex direction="column" gap="md">
                {results.length>0 ? <>
                    <Title order={4} ta="center">Top player scores</Title>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Th>Player</Table.Th>
                                <Table.Th>Highscore</Table.Th>
                            </Table.Tr>
                            {results.map((r, k) => <Table.Tr key={k}>
                                <Table.Td>{r.player}</Table.Td>
                                <Table.Td>{r.score}</Table.Td>
                            </Table.Tr>)}
                        </Table.Tbody>
                    </Table>
                </> : <Title order={4} ta="center">No one played the game yet!</Title>}
            </Flex>
        </Modal>
    </>
}

function Navbar({logged, setLogged}) {
    const [modalUserOpened, setModalUserOpened] = useState(false)
    const [modalScoresOpened, setModalScoresOpened] = useState(false)

    const loadAuth = async () => {
        try {
            const user = await API.getUserInfo()
            setLogged(true)
            console.log(user)
        } catch(err) {
            console.error(err.error)
        }
    }

    const doLogin = async (credentials) => {
        try {
            const username = await API.login(credentials)
            const user = await API.getUserInfo()
            setLogged(true)
            setModalUserOpened(false)
        } catch(err) {
            console.error(err.error)
        }
    }

    const doLogout = async () => {
        await API.logout()
        setLogged(false)
        setModalUserOpened(false)
    }

    const checkAuth = async () => {
        try {
            setLogged(await API.getUserAuth())
        } catch(err) {
            setLogged(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    return <>
        <ModalLogin
            opened={modalUserOpened && !logged}
            close={() => setModalUserOpened(false)}
            login={doLogin}
        />
        <ModalLogout
            opened={modalUserOpened && logged}
            close={() => setModalUserOpened(false)}
            logout={doLogout}
        />
        <ModalScores
            opened={modalScoresOpened}
            close={() => setModalScoresOpened(false)}
        />
        <Flex gap="sm" id="navbar">
            <Link to="/home" id="nav-title">
                <Flex ml="5">
                    <Icon.Logo size="35" stroke="#005"/>
                    <Title order={2} c="#005" ml="6">BPMN BattleCards</Title>
                </Flex>
            </Link>
            <Divider orientation="vertical" />
            <Button
                variant="filled"
                color="green"
                onClick={() => setModalScoresOpened(true)}
            >Leaderboard</Button>
            {logged ? <Button.Group>
                <Button variant="light" color="green">Loggedin as tiziocaio</Button>
                <Button
                    variant="filled"
                    color="green"
                    rightSection={<Icon.Logout color="white"/>}
                    onClick={() => setModalUserOpened(true)}
                >Logout</Button>
            </Button.Group>
            : <Button
                variant="filled"
                color="green"
                rightSection={<Icon.User color="white"/>}
                onClick={() => setModalUserOpened(true)}
            >Login</Button>}
        </Flex>
    </>
}

export default Navbar