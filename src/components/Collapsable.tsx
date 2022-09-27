import styles from 'components/Collapsable.module.css'
import { ChevronDownIcon } from 'components/FeatherIcon.js'
import { useCollapsed } from 'hooks/useCollapsed.js'

export const Collapsable = ({
	id,
	title,
	children,
	...restProps
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
			<section className={styles.collapsable} id={id} {...restProps}>
				<header
					onClick={handleClick}
					role={'button'}
					tabIndex={0}
					onKeyDown={handleKey}
					aria-expanded="false"
					className={styles.collapsableHeader}
				>
					<div>{title}</div>
					<ChevronDownIcon className={styles.chevron} />
				</header>
			</section>
		)

	return (
		<section className={styles.collapsable} id={id} {...restProps}>
			<header
				onClick={handleClick}
				role={'button'}
				tabIndex={0}
				onKeyDown={handleKey}
				aria-expanded="true"
				className={styles.collapsableHeader}
			>
				<div>{title}</div>
				<ChevronDownIcon className={styles.chevron} />
			</header>
			<div className="mt-4">{children}</div>
		</section>
	)
}
