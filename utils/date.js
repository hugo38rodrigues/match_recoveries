export const generateDates = () => {
	const today = new Date()
	const futureDate = new Date(today)

	futureDate.setDate(today.getDate() + 14)

	const formattedToday = today.toISOString()
	const formattedFutureDate = futureDate.toISOString()

	return {
		today: formattedToday,
		futureDate: formattedFutureDate
	}
}

export const getYers = () => {
	return new Date().getYers
  
}