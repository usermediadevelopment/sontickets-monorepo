import {FormField} from '@sanity/base/components'
import PatchEvent, {set, unset} from '@sanity/form-builder/PatchEvent'
import {Stack, Checkbox} from '@sanity/ui' // Ensure you import other necessary components

function DietaryPreferencesField({type, value, onChange}) {
  const handleCheckboxChange = (optionValue: string) => {
    if (value.includes(optionValue)) {
      // Remove the option
      onChange(PatchEvent.from(unset([`dietaryPreferences[_key=="${optionValue}"]`])))
    } else {
      // Add the option
      onChange(PatchEvent.from(set(optionValue, ['dietaryPreferences'])))
    }
  }

  return (
    <FormField title={type.title} description={type.description}>
      <Stack space={3}>
        {type.options.list.map((option) => (
          <Checkbox
            key={option.value}
            checked={value.includes(option.value)}
            onChange={() => handleCheckboxChange(option.value)}
          >
            {option.title}
          </Checkbox>
        ))}
      </Stack>
    </FormField>
  )
}

export default DietaryPreferencesField
