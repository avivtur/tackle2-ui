import * as React from "react";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import { useSelectionState } from "@migtools/lib-ui";
import { TableURLParamKeyPrefix } from "@app/Constants";
import { AnalysisFileReport } from "@app/api/models";
import { useFetchIncidents } from "@app/queries/issues";
import { SimplePagination } from "@app/components/SimplePagination";
import {
  TableHeaderContentWithControls,
  ConditionalTableBody,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import {
  getHubRequestParams,
  useTableControlProps,
  useTableControlUrlParams,
} from "@app/hooks/table-controls";
import ReactMarkdown from "react-markdown";
import { markdownPFComponents } from "@app/components/markdownPFComponents";

export interface IFileRemainingIncidentsTableProps {
  fileReport: AnalysisFileReport;
}

export const FileAllIncidentsTable: React.FC<
  IFileRemainingIncidentsTableProps
> = ({ fileReport }) => {
  const tableControlState = useTableControlUrlParams({
    urlParamKeyPrefix: TableURLParamKeyPrefix.issuesRemainingIncidents,
    columnNames: {
      line: "Line #",
      message: "Message",
    },
    sortableColumns: ["line", "message"],
    initialSort: { columnKey: "line", direction: "asc" },
    initialItemsPerPage: 10,
    variant: "compact",
  });

  const {
    result: { data: currentPageIncidents, total: totalItemCount },
    isFetching,
    fetchError,
  } = useFetchIncidents(
    fileReport.issueId,
    getHubRequestParams({
      ...tableControlState,
      hubSortFieldKeys: { line: "line", message: "message" },
      implicitFilters: [
        { field: "file", operator: "=", value: fileReport.file },
      ],
    })
  );

  const tableControls = useTableControlProps({
    ...tableControlState,
    idProperty: "id",
    currentPageItems: currentPageIncidents,
    forceNumRenderedColumns: 3,
    totalItemCount,
    isLoading: isFetching,
    // TODO FIXME - we don't need selectionState but it's required by this hook?
    selectionState: useSelectionState({
      items: currentPageIncidents,
      isEqual: (a, b) => a.id === b.id,
    }),
  });

  const {
    numRenderedColumns,
    propHelpers: { paginationProps, tableProps, getThProps, getTdProps },
  } = tableControls;

  return (
    <>
      <Table {...tableProps} aria-label="Affected files table">
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "line" })} modifier="nowrap" />
              <Th {...getThProps({ columnKey: "message" })} modifier="nowrap" />
              <Th>
                <SimplePagination
                  idPrefix="file-all-incidents-table"
                  isTop
                  isCompact
                  paginationProps={paginationProps}
                />
              </Th>
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isLoading={isFetching}
          isError={!!fetchError}
          isNoData={totalItemCount === 0}
          numRenderedColumns={numRenderedColumns}
        >
          <Tbody>
            {currentPageIncidents?.map((incident, rowIndex) => (
              <Tr key={incident.id}>
                <TableRowContentWithControls
                  {...tableControls}
                  item={incident}
                  rowIndex={rowIndex}
                >
                  <Td width={20} {...getTdProps({ columnKey: "line" })}>
                    {incident.line}
                  </Td>
                  <Td
                    width={80}
                    modifier="truncate"
                    colSpan={2}
                    {...getTdProps({ columnKey: "message" })}
                  >
                    <ReactMarkdown components={markdownPFComponents}>
                      {`${incident.message.split("\n")[0]} ...`}
                    </ReactMarkdown>
                  </Td>
                </TableRowContentWithControls>
              </Tr>
            ))}
          </Tbody>
        </ConditionalTableBody>
      </Table>
      <SimplePagination
        idPrefix="file-all-incidents-table"
        isTop={false}
        isCompact
        noMargin
        paginationProps={paginationProps}
      />
    </>
  );
};
