import { useAuth } from 'hooks/useAuth'

export const App = () => {
	const { attributes, signOut } = useAuth()

	return (
		<>
			<p>Hello {attributes.email}!</p>
			<p>
				<button
					type="button"
					onClick={() => {
						signOut()
					}}
				>
					Sign out
				</button>
			</p>
		</>
	)
}
