export const TextWithIcon = ({
	icon,
	children,
}: {
	children: React.ReactElement<any> | React.ReactElement<any>[] | string
	icon: React.ReactElement<any>
}) => (
	<span>
		{icon}
		{children}
	</span>
)
