import { ref, type Ref, watch } from 'vue'

type FieldValue = string | number
type InitialFields<T extends Record<string, FieldValue>> = T

type ValidationRules<T extends Record<string, FieldValue>> = {
  [K in keyof T]: (value: T[K]) => boolean
}

interface FieldValidationReturn<T extends Record<string, FieldValue>> {
  fields: { [K in keyof T]: Ref<T[K]> }
  errors: { [K in keyof T]: Ref<boolean> }
  validateFields: () => boolean
}

export function useFieldValidation<T extends Record<string, FieldValue>>(
  initialFields: InitialFields<T>,
  validationRules: ValidationRules<T>,
): FieldValidationReturn<T> {
  const fields = {} as { [K in keyof T]: Ref<T[K]> }
  const errors = {} as { [K in keyof T]: Ref<boolean> }

  Object.keys(initialFields).forEach((key) => {
    fields[key as keyof T] = ref(initialFields[key as keyof T]) as Ref<T[typeof key]>
    errors[key as keyof T] = ref(false)
  })

  const validateFields = (): boolean => {
    let allValid = true

    Object.keys(fields).forEach((key) => {
      const rule = validationRules[key as keyof T]
      if (typeof rule === 'function') {
        const isValid = rule(fields[key as keyof T].value)
        errors[key as keyof T].value = !isValid
        if (!isValid) allValid = false
      }
    })

    return allValid
  }

  Object.keys(fields).forEach((key) => {
    watch(fields[key as keyof T], (newValue) => {
      const rule = validationRules[key as keyof T]
      if (typeof rule === 'function') {
        const isValid = rule(newValue)
        errors[key as keyof T].value = !isValid
      }
    })
  })

  return {
    fields,
    errors,
    validateFields,
  }
}
