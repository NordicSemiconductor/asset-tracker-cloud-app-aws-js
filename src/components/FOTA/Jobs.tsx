import { Job } from 'components/FOTA/Job.js'
import { NoData } from 'components/NoData.js'
import { useFOTA } from 'hooks/useFOTA.js'

export const Jobs = () => {
	const { jobs } = useFOTA()
	if (jobs.length === 0) return <NoData>No jobs for this device.</NoData>
	return (
		<div data-test="firmware-upgrade-jobs">
			{jobs.map((job) => (
				<Job key={job.jobId} job={job} />
			))}
		</div>
	)
}
