import { useState } from 'react'

export const Toggle = ({
	children,
	className,
}: {
	children: React.ReactElement<any> | (React.ReactElement<any> | null)[]
	className?: string
}) => {
	const [toggled, setToggled] = useState(false)

	const toggle = () => {
		const state = !toggled
		setToggled(state)
	}

	const handleKey = (e: React.KeyboardEvent<HTMLElement>) => {
		if (e.code === 'Enter') {
			e.stopPropagation()
			e.preventDefault()
			toggle()
		}
	}

	const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation()
		e.preventDefault()
		toggle()
	}

	return (
		<div
			className={`${className} toggle`}
			onClick={handleClick}
			role={'button'}
			tabIndex={0}
			onKeyDown={handleKey}
			data-toggled={toggled ? '1' : '0'}
		>
			{children}
		</div>
	)
}
