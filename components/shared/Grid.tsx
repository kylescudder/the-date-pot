'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import {
  ColDef,
  GridOptions,
  GridSizeChangedEvent,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
  RowStyle
} from 'ag-grid-community'

const Grid = (props: {
  records: any[]
  columns: ColDef[]
  placeholder: string
  rowClicked: any
  rowFormatter: RowStyle
}) => {
  const [rowData, setRowData] = useState<any[]>(props.records)
  const [columnDefs, setColumnDefs] = useState<ColDef[]>(props.columns)
  const autoSizeStrategy = useMemo<
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy
  >(() => {
    return {
      type: 'fitGridWidth'
    }
  }, [])

  useEffect(() => {
    setRowData(props.records)
  }, [props.records])

  const onGridSizeChanged = useCallback((params: GridSizeChangedEvent) => {
    // get the current grids width
    var gridWidth = document.getElementById('grid-wrapper')!.offsetWidth
    // keep track of which columns to hide/show
    var columnsToShow = []
    var columnsToHide = []
    // iterate over all columns (visible or not) and work out
    // now many columns can fit (based on their minWidth)
    var totalColsWidth = 0
    var allColumns = params.api.getColumns()
    if (allColumns && allColumns.length > 0) {
      for (var i = 0; i < allColumns.length; i++) {
        var column = allColumns[i]
        totalColsWidth += column.getMinWidth() || 0
        if (totalColsWidth > gridWidth) {
          columnsToHide.push(column.getColId())
        } else {
          columnsToShow.push(column.getColId())
        }
      }
    }
    // show/hide columns based on current grid width
    params.api.setColumnsVisible(columnsToShow, true)
    params.api.setColumnsVisible(columnsToHide, false)
    // fill out any available space to ensure there are no gaps
    params.api.sizeColumnsToFit()
  }, [])
  const gridOptions: GridOptions = {
    domLayout: 'autoHeight', // Allows the grid to automatically adjust its height based on the number of rows
    overlayNoRowsTemplate: `<span style="padding: 10px;">${props.placeholder}</span>`,
    loadingCellRendererParams: {
      loadingMessage: 'Getting your pot...'
    },
    getRowStyle(params) {
      if (props.rowFormatter) {
        if (params.data.purchased) {
          return { backgroundColor: '#5865F2', color: 'white' }
        } else {
          return { backgroundColor: '#FDFD96', color: 'black' }
        }
      }
    }
  }
  return (
    <div className="h-full w-full">
      <div id="grid-wrapper" className="h-screen w-full">
        <div className={'ag-theme-quartz-dark w-full h-full'}>
          <AgGridReact
            gridOptions={gridOptions}
            rowData={rowData}
            columnDefs={columnDefs}
            autoSizeStrategy={autoSizeStrategy}
            onGridSizeChanged={onGridSizeChanged}
            onRowClicked={props.rowClicked}
          />
        </div>
      </div>
    </div>
  )
}

export default Grid
