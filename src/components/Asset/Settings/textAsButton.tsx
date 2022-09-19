export const TextAsButton = ({
	role,
	tabIndex,
	onClick,
	onKeyPress,
	children,
	className,
}: {
	role: string
	tabIndex: number
	onClick: () => any
	onKeyPress: () => any
	children: React.ReactNode
	className?: string
}) => {
	return (
		<u
			role={role}
			tabIndex={tabIndex}
			onClick={() => onClick()}
			onKeyPress={() => onKeyPress()}
			className={className}
		>
			{children}
		</u>
	)
}
