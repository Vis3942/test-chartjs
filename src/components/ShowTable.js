import * as React from "react";
import PropTypes from "prop-types";
import { useTheme, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { useLayoutEffect, useRef, useEffect } from "react";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "lightyellow",
    color: "blue",
    width: "fit-content"
    },
}));

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default function CustomPaginationActionsTable({
  displayData,
  compHeight,
}) {
  const [rows, setRows] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [compRowHeight, setCompRowHeight] = React.useState(0);

  const tableRef = useRef(null);
  const tableContRef = useRef(null);

  const [rowsPerPageOpts, setRowsPerPageOpts] = React.useState([
    5,
    10,
    25,
    { label: "All", value: -1 },
  ]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useLayoutEffect(() => {
    const numberRowsInPanel = 5;
    setRows(formatTableData(displayData));
    let tmp_page = Math.floor(displayData.labels.length / rowsPerPage);
    if (displayData.labels.length % rowsPerPage === 0) {
      tmp_page = tmp_page - 1;
      if (tmp_page < 0) {
        tmp_page = 0;
      }
    }
    setPage(tmp_page);
    //console.log("table container ht: " + tableContRef.current.offsetHeight);
    //console.log("table ht: " + tableRef.current.offsetHeight);
    if (compRowHeight === 0) {
      setCompRowHeight(
        Math.floor(
          (tableContRef.current.parentElement.offsetHeight - 110) /
            numberRowsInPanel
        )
      );
    }
  }, [displayData.labels.length, displayData.labels[0]]);

  // useEffect(() => {
  //     console.log(tableRef.current.offsetHeight);
  // }, [displayData.labels.length < (rowsPerPage + 1)]);

  function formatTableData(displayData, compHeight) {
    let rows = [];
    for (let ii in displayData.labels) {
      rows.push({
        timestamp: displayData.labels[ii],
        value: displayData.datasets[0].data[ii],
      });
    }
    return rows;
  }

  return (
    <TableContainer
      component={Paper}
      ref={tableContRef}
      sx={{
        ml: 15,
        mr: 15,
        height: compHeight,
        overflowY: "auto",
        overflowX: "auto",
        marginLeft: "3px",
        marginRight: "3px"
      }}
    >
      <Table
        ref={tableRef}
        sx={{
          minWidth: 50,
          background: "lightyellow",
        }}
        aria-label="custom pagination table"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <StyledTableCell>TimeStamp</StyledTableCell>
            <StyledTableCell align="center">
              {displayData.datasets[0].label}
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row, index) => (
            <TableRow
              key={index}
              hover
              sx={{
                height: compRowHeight,
              }}
            >
              <TableCell
                scope="row"
                sx={{
                  p: "0px 16px",
                  width: "fit-content",
                }}
              >
                {row.timestamp[1] + " " + row.timestamp[0]}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  p: "0px 16px",
                  width: "fit-content",
                }}
              >
                {row.value}
              </TableCell>
            </TableRow>
          ))}

          {emptyRows > 0 && (
            <TableRow style={{ height: compRowHeight * emptyRows }}>
              <TableCell colSpan={2} />
            </TableRow>
          )}

          {rows.length < rowsPerPage && (
            <TableRow
              style={{ height: compRowHeight * (rowsPerPage - rows.length) }}
            >
              <TableCell colSpan={2} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={rowsPerPageOpts}
              colSpan={3}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  "aria-label": "rows per page",
                },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
