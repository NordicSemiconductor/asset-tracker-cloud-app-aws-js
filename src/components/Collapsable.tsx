import styles from 'components/Collapsable.module.css'
import { ChevronDownIcon } from 'components/FeatherIcon'
import { useCollapsed } from 'hooks/useCollapsed'

export const Collapsable = ({
	id,
	title,
	children,
}: {
	id: string
	title: React.ReactElement<any>
	children: React.ReactElement<any> | (React.ReactElement<any> | null)[]
}) => {
	const { collapsed, toggle } = useCollapsed(id)

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

	if (collapsed)
		return (
			<section className={styles.collapsable} id={id}>
				<header
					onClick={handleClick}
					role={'button'}
					tabIndex={0}
					onKeyDown={handleKey}
					aria-expanded="false"
				>
					<div>{title}</div>
					<ChevronDownIcon className={styles.chevron} />
				</header>
			</section>
		)

	return (
		<section className={styles.collapsable}>
			<header
				onClick={handleClick}
				role={'button'}
				tabIndex={0}
				onKeyDown={handleKey}
				aria-expanded="true"
			>
				<div>{title}</div>
				<ChevronDownIcon className={styles.chevron} />
			</header>
			<div>{children}</div>
		</section>
	)
}
