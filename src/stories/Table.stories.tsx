import { Box, ChakraProvider, Checkbox, extendTheme, Input, Select, Switch } from "@chakra-ui/react"
import { EditableTable } from "../components/EditableTable"
import { connect, useLape } from "lape"
import type { ChangeEvent } from "react"
import { colorSchemeOverrides, themeOverrides } from "../theme"
import type { Field, Fields } from "../types"
import type { Column, FormatterProps } from "react-data-grid"
import { useRowSelection } from "react-data-grid"
export default {
  title: "React spreadsheet import",
}

export const SELECT_COLUMN_KEY = "select-row"

function SelectFormatter(props: FormatterProps<unknown>) {
  const [isRowSelected, onRowSelectionChange] = useRowSelection()

  return (
    <Checkbox
      bg="white"
      aria-label="Select"
      isChecked={isRowSelected}
      onChange={(event) => {
        onRowSelectionChange({
          row: props.row,
          checked: Boolean(event.target.checked),
          isShiftClick: (event.nativeEvent as MouseEvent).shiftKey,
        })
      }}
    />
  )
}

const SelectColumn: Column<any, any> = {
  key: SELECT_COLUMN_KEY,
  name: "",
  width: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  cellClass: "rdg-checkbox",
  formatter: SelectFormatter,
}

const theme = extendTheme(colorSchemeOverrides, themeOverrides)

const TableComponent = connect(() => {
  const data = [
    {
      id: 0,
      test: "Hello",
      second: "one",
      bool: true,
    },
    {
      id: 1,
      test: "Hello",
      second: "two",
      bool: true,
    },
    {
      id: 2,
      test: "Hello",
      second: "one",
      bool: false,
    },
    {
      id: 3,
      test: "Hello",
      second: "two",
      bool: true,
    },
  ]

  const fields: Fields = [
    {
      key: "test",
      label: "Tests",
      fieldType: { type: "input" },
    },
    {
      key: "second",
      label: "Second",
      fieldType: {
        type: "select",
        options: [
          { label: "One", value: "one" },
          { label: "Two", value: "two" },
        ],
      },
    },
    {
      key: "bool",
      label: "Bool",
      fieldType: { type: "checkbox" },
    },
  ]

  const state = useLape<{
    data: any[]
    errorCount: number
    filterErrors: boolean
    selectedRows: ReadonlySet<number | string>
  }>({
    data: data,
    errorCount: 0,
    filterErrors: false,
    selectedRows: new Set(),
  })

  const updateSelect = (row: any, key: string) => (event: ChangeEvent<HTMLSelectElement>) => {
    row[key] = event.target.value
  }
  const updateInput = (row: any, key: string) => (event: ChangeEvent<HTMLInputElement>) => {
    row[key] = event.target.value
  }
  const updateSwitch = () => {}
  const columns = [
    SelectColumn,
    ...fields.map((column: Field) => ({
      key: column.key,
      name: column.label,
      resizable: true,
      editable: column.fieldType.type !== "checkbox",
      editor: ({ row }: any) =>
        column.fieldType.type === "select" ? (
          <Box pl="0.5rem">
            <Select
              variant="unstyled"
              autoFocus
              size="small"
              value={row[column.key]}
              onChange={updateSelect(row, column.key)}
            >
              {column.fieldType.options.map((option) => (
                <option value={option.value}>{option.label}</option>
              ))}
            </Select>
          </Box>
        ) : (
          <Box pl="0.5rem">
            <Input
              variant="unstyled"
              autoFocus
              size="small"
              value={row[column.key]}
              onChange={updateInput(row, column.key)}
            />
          </Box>
        ),
      editorOptions: {
        editOnClick: true,
      },
      formatter: ({ row }: any) =>
        column.fieldType.type === "checkbox" ? (
          <Box display="flex" alignItems="center" height="100%">
            <Switch onChange={updateSwitch} />
          </Box>
        ) : column.fieldType.type === "select" ? (
          column.fieldType.options.find((option) => option.value === row[column.key])?.label
        ) : (
          row[column.key]
        ),
      cellClass: (row: { _errors: any[] | null; id: string }) =>
        row._errors?.length && row._errors.find((err) => err.fieldName === column.key) ? "rdg-cell-error" : "",
    })),
  ]

  return (
    <EditableTable
      rowKeyGetter={(row) => row.id}
      rows={state.data}
      columns={columns}
      selectedRows={state.selectedRows}
      onSelectedRowsChange={(rows) => {
        state.selectedRows = rows
      }}
    />
  )
})

export const Table = () => (
  <ChakraProvider theme={theme}>
    <div style={{ blockSize: "calc(100vh - 32px)" }}>
      <TableComponent />
    </div>
  </ChakraProvider>
)