import * as React from "react";

import { useTranslation } from "react-i18next";

import { Application } from "@app/api/models";
import { useFetchIdentities } from "@app/queries/identities";
import { useFetchTagCategories } from "@app/queries/tags";
import {
  FilterCategory,
  FilterType,
} from "@app/components/FilterToolbar/FilterToolbar";
import { useLegacyFilterState } from "@app/hooks/useLegacyFilterState";
import { useLegacyPaginationState } from "@app/hooks/useLegacyPaginationState";
import { useLegacySortState } from "@app/hooks/useLegacySortState";
import { dedupeFunction } from "@app/utils/utils";
import { useSelectionState } from "@migtools/lib-ui";
export enum ApplicationTableType {
  Assessment = "assessment",
  Analysis = "analysis",
}
export const useApplicationsFilterValues = (
  tableType: string,
  applications: Application[] = []
) => {
  const { identities } = useFetchIdentities();

  const { t } = useTranslation();

  const { tagCategories: tagCategories } = useFetchTagCategories();

  const filterCategories: FilterCategory<
    Application,
    | "name"
    | "description"
    | "businessService"
    | "identities"
    | "repository"
    | "binary"
    | "tags"
  >[] = [
    {
      key: "name",
      title: t("terms.name"),
      type: FilterType.search,
      placeholderText:
        t("actions.filterBy", {
          what: t("terms.name").toLowerCase(),
        }) + "...",
      getItemValue: (item) => item?.name || "",
    },
    {
      key: "description",
      title: t("terms.description"),
      type: FilterType.search,
      placeholderText:
        t("actions.filterBy", {
          what: t("terms.description").toLowerCase(),
        }) + "...",
      getItemValue: (item) => item.description || "",
    },
    {
      key: "businessService",
      title: t("terms.businessService"),
      placeholderText:
        t("actions.filterBy", {
          what: t("terms.businessService").toLowerCase(),
        }) + "...",
      type: FilterType.select,
      selectOptions: dedupeFunction(
        applications
          .filter((app) => !!app.businessService?.name)
          .map((app) => app.businessService?.name)
          .map((name) => ({ key: name, value: name }))
      ),
      getItemValue: (item) => item.businessService?.name || "",
    },
    {
      key: "identities",
      title: t("terms.credentialType"),
      placeholderText:
        t("actions.filterBy", {
          what: t("terms.credentialType").toLowerCase(),
        }) + "...",
      type: FilterType.multiselect,
      selectOptions: [
        { key: "source", value: "Source" },
        { key: "maven", value: "Maven" },
        { key: "proxy", value: "Proxy" },
      ],
      getItemValue: (item) => {
        const searchStringArr: string[] = [];
        item.identities?.forEach((appIdentity) => {
          const matchingIdentity = identities.find(
            (identity) => identity.id === appIdentity.id
          );
          searchStringArr.push(matchingIdentity?.kind || "");
        });
        const searchString = searchStringArr.join("");
        return searchString;
      },
    },
    {
      key: "repository",
      title: t("terms.repositoryType"),
      placeholderText:
        t("actions.filterBy", {
          what: t("terms.repositoryType").toLowerCase(),
        }) + "...",
      type: FilterType.select,
      selectOptions: [
        { key: "git", value: "Git" },
        { key: "subversion", value: "Subversion" },
      ],
      getItemValue: (item) => item?.repository?.kind || "",
    },
    {
      key: "binary",
      title: t("terms.artifact"),
      placeholderText:
        t("actions.filterBy", {
          what: t("terms.artifact").toLowerCase(),
        }) + "...",
      type: FilterType.select,
      selectOptions: [
        { key: "binary", value: t("terms.artifactAssociated") },
        { key: "none", value: t("terms.artifactNotAssociated") },
      ],
      getItemValue: (item) => {
        const hasBinary =
          item.binary !== "::" && item.binary?.match(/.+:.+:.+/)
            ? "binary"
            : "none";

        return hasBinary;
      },
    },
    {
      key: "tags",
      title: t("terms.tags"),
      type: FilterType.multiselect,
      placeholderText:
        t("actions.filterBy", {
          what: t("terms.tagName").toLowerCase(),
        }) + "...",
      getItemValue: (item) => {
        let tagNames = item?.tags?.map((tag) => tag.name).join("");
        return tagNames || "";
      },
      selectOptions: dedupeFunction(
        tagCategories
          ?.map((tagCategory) => tagCategory?.tags)
          .flat()
          .filter((tag) => tag && tag.name)
          .map((tag) => ({ key: tag?.name, value: tag?.name }))
      ),
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useLegacyFilterState(
    applications || [],
    filterCategories,
    "applicationsFilter"
  );

  const handleOnClearAllFilters = () => {
    setFilterValues({});
  };

  const getSortValues = (item: Application) => [
    "",
    item?.name || "",
    "",
    item.businessService?.name || "",
    "",
    ...(tableType === ApplicationTableType.Assessment ? [""] : []),
    item.tags?.length || 0,
    "", // Action column
  ];

  const { sortBy, onSort, sortedItems } = useLegacySortState(
    filteredItems,
    getSortValues
  );

  //Bulk selection
  const {
    isItemSelected: isRowSelected,
    toggleItemSelected: toggleRowSelected,
    selectAll,
    selectMultiple,
    areAllSelected,
    selectedItems: selectedRows,
  } = useSelectionState<Application>({
    items: filteredItems || [],
    isEqual: (a, b) => a.id === b.id,
  });

  const { currentPageItems, setPageNumber, paginationProps } =
    useLegacyPaginationState(sortedItems, 10);

  const [activeAppInDetailDrawer, openDetailDrawer] =
    React.useState<Application | null>(null);
  const closeDetailDrawer = () => openDetailDrawer(null);

  return {
    currentPageItems,
    paginationProps,
    sortBy,
    onSort,
    filterCategories,
    filterValues,
    setFilterValues,
    handleOnClearAllFilters,
    isRowSelected,
    toggleRowSelected,
    selectAll,
    selectMultiple,
    areAllSelected,
    selectedRows,
    openDetailDrawer,
    closeDetailDrawer,
    activeAppInDetailDrawer,
    setPageNumber,
  };
};
