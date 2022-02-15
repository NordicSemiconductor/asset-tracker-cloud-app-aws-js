import styles from 'components/CollapsableCard.module.css'
import { ChevronDownIcon } from 'components/FeatherIcon'
import { useCollapsed } from 'hooks/useCollapsed'

export const CollapsableCard = ({
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
			<div className={`${styles.collapsable} card`} id={id}>
				<div
					onClick={handleClick}
					role={'button'}
					tabIndex={0}
					onKeyDown={handleKey}
					aria-expanded="false"
					className={`${styles.collapsableHeader} card-header`}
				>
					<div>{title}</div>
					<ChevronDownIcon className={styles.chevron} />
				</div>
			</div>
		)

	return (
		<div className={`${styles.collapsable} card`} id={id}>
			<div
				onClick={handleClick}
				role={'button'}
				tabIndex={0}
				onKeyDown={handleKey}
				aria-expanded="true"
				className={`${styles.collapsableHeader} card-header`}
			>
				<div>{title}</div>
				<ChevronDownIcon className={styles.chevron} />
			</div>
			{children}
		</div>
	)
}
