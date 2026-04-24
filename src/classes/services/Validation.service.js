export class ValidationService {
	isEmptyValue (value) {
		return value === null || value === '' || value === undefined
	}

	hasEmptyRequiredField (fields) {
		return Object.values(fields).some((field) => {
			if (this.isEmptyValue(field)) return true
			if (Array.isArray(field)) return field.length === 0
			if (typeof field === 'object') {
				return Object.values(field).some((val) => this.isEmptyValue(val))
			}
			return false
		})
	}
}