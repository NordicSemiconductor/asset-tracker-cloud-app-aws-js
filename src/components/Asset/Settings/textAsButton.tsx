export const TextAsButton = ({
	role,
	tabIndex,
	onClick,
	onKeyPress,
	children,
}: {
	role: string
	tabIndex: number
	onClick: () => any
	onKeyPress: () => any
	children: React.ReactNode
}) => {
	return (
		<u
			role={role}
			tabIndex={tabIndex}
			onClick={() => onClick()}
			onKeyPress={() => onKeyPress()}
		>
			{children}
		</u>
	)
}
