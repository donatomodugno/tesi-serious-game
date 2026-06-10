import { Flex, Button, Title, Divider } from '@mantine/core'
import { Link } from 'react-router'
import { Icon } from '../icons'

function Navbar({logged=true}) {
    const buttons = [
        // {path: '/gameboard', text: 'Gameboard'},
        // {path: '/bpmn', text: 'BPMN'},
        // {path: '/new', text: 'New game'},
    ]

    return <Flex gap="sm" id="navbar">
        <Link to="/home" id="nav-title">
            <Title order={2}>BPMN BattleCards</Title>
        </Link>
        <Divider orientation="vertical" />
        {buttons.map((b,i) => (
            <Link to={b.path} key={i}>
                <Button color="green">{b.text}</Button>
            </Link>
        ))}
        {logged ? <Button.Group>
            <Button variant="light" color="green">Loggedin as tiziocaio</Button>
            <Button variant="filled" color="green" rightSection={<Icon.Logout color="white"/>}>Logout</Button>
        </Button.Group>
        : <Button variant="light" color="green">Login</Button>}
    </Flex>
}

export default Navbar