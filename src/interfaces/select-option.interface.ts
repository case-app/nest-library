// Corresponds to an item destined to be rendered in the front-end as an <option> tag in a <select> tag.
export interface SelectOption {
  label: string
  // Type is a mandatory "string" because values with return inevitably as strings when coming back from HTML "value" attr.
  value: string

  subLabel?: string
  selected?: boolean
  disabled?: boolean
}
