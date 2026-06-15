import { Flex, Button, Title, Divider, Modal, TextInput, PasswordInput, Text } from '@mantine/core'
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
        {/* <Modal
            opened={opened}
            onClose={close}
            title={<Text size="xl" fw="bold" ml="10">Login</Text>}
            transitionProps={{transition: 'pop-top-left'}}
            size="xs"
        >
            <Flex direction="column" gap="md">
                <TextInput
                    leftSectionPointerEvents="none"
                    leftSection="📧"
                    label="Your email"
                    placeholder="Your email"
                    value={username}
                    onChange={(ev) => setUsername(ev.target.value)}
                />
                <PasswordInput
                    leftSectionPointerEvents="none"
                    leftSection="🔒"
                    label="Password"
                    placeholder="Password"
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                />
                {errorMessage ? <Text c="red">{errorMessage}</Text> : null}
                <Flex justify="center" gap="md" mt="20">
                    <Button onClick={close} color="grey" variant="light">Cancel</Button>
                    <Button onClick={handleSubmit} color="green">Login</Button>
                </Flex>
            </Flex>
        </Modal> */}
        {/* Commentato perché non riuscivo a centrare il titolo */}
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

function Navbar({logged, setLogged}) {
    const [modalOpened, setModalOpened] = useState(false)

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
            setModalOpened(false)
        } catch(err) {
            console.error(err.error)
        }
    }

    const doLogout = async () => {
        await API.logout()
        setLogged(false)
        setModalOpened(false)
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
            opened={modalOpened && !logged}
            close={() => setModalOpened(false)}
            login={doLogin}
        />
        <ModalLogout
            opened={modalOpened && logged}
            close={() => setModalOpened(false)}
            logout={doLogout}
        />
        <Flex gap="sm" id="navbar">
            <Link to="/home" id="nav-title">
                <Flex ml="5">
                    <Icon.Logo size="35" stroke="#005"/>
                    <Title order={2} c="#005" ml="6">BPMN BattleCards</Title>
                </Flex>
            </Link>
            <Divider orientation="vertical" />
            {logged ? <Button.Group>
                <Button variant="light" color="green">Loggedin as tiziocaio</Button>
                <Button
                    variant="filled"
                    color="green"
                    rightSection={<Icon.Logout color="white"/>}
                    onClick={() => setModalOpened(true)}
                >Logout</Button>
            </Button.Group>
            : <Button
                variant="filled"
                color="green"
                rightSection={<Icon.User color="white"/>}
                onClick={() => setModalOpened(true)}
            >Login</Button>}
        </Flex>
    </>
}

export default Navbar