import { Flex, Button, Title } from '@mantine/core'
import { Link } from 'react-router'

function Navbar({}) {
    const buttons = [
        {path: '/gameboard', text: 'Gameboard'},
        {path: '/bpmn', text: 'BPMN'},
        {path: '/new', text: 'New game'},
    ]

    return <Flex gap="sm" id="navbar">
        <Link to="/home" id="nav-title"><Title order={2}>BPMN BattleCards</Title></Link>
        {buttons.map((b,i) => (
            <Link to={b.path} key={i}>
                <Button color="green">{b.text}</Button>
            </Link>
        ))}
    </Flex>
}

export default Navbar