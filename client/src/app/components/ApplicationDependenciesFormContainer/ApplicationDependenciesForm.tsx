import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ActionGroup,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Spinner,
  Text,
  TextContent,
} from "@patternfly/react-core";

import { OptionWithValue } from "@app/components/SimpleSelect";

import { Application, ApplicationDependency } from "@app/api/models";

import { FormContext } from "./FormContext";
import { SelectDependency } from "./SelectDependency";
import { getAxiosErrorMessage } from "@app/utils/utils";
import { useFetchApplications } from "@app/queries/applications";
import useFetchApplicationDependencies from "@app/hooks/useFetchApplicationDependencies/useFetchApplicationDependencies";

const northToStringFn = (value: ApplicationDependency) => value.from.name;
const southToStringFn = (value: ApplicationDependency) => value.to.name;

const dependencyToOption = (
  value: ApplicationDependency,
  toStringFn: (value: ApplicationDependency) => string
): OptionWithValue<ApplicationDependency> => ({
  value,
  toString: () => toStringFn(value),
});

export interface ApplicationDependenciesFormProps {
  application: Application;
  onCancel: () => void;
}

export const ApplicationDependenciesForm: React.FC<
  ApplicationDependenciesFormProps
> = ({ application, onCancel }) => {
  const {
    isNorthBeingSaved,
    isSouthBeingSaved,
    northSaveError,
    southSaveError,
    setIsNorthBeingSaved,
    setIsSouthBeingSaved,
    setNorthSaveError,
    setSouthSaveError,
  } = useContext(FormContext);

  const { t } = useTranslation();

  const [northboundDependencies, setNorthboundDependencies] = useState<
    OptionWithValue<ApplicationDependency>[]
  >([]);
  const [southboundDependencies, setSouthboundDependencies] = useState<
    OptionWithValue<ApplicationDependency>[]
  >([]);

  // Dependencies

  const {
    applicationDependencies: northDependencies,
    isFetching: isFetchingNorthDependencies,
    fetchError: fetchErrorNorthDependencies,
    fetchAllApplicationDependencies: fetchAllNorthDependencies,
  } = useFetchApplicationDependencies();

  const {
    applicationDependencies: southDependencies,
    isFetching: isFetchingSouthDependencies,
    fetchError: fetchErrorSouthDependencies,
    fetchAllApplicationDependencies: fetchAllSouthDependencies,
  } = useFetchApplicationDependencies();

  useEffect(() => {
    fetchAllNorthDependencies({
      to: [`${application.id}`],
    });
  }, [application, fetchAllNorthDependencies]);

  useEffect(() => {
    fetchAllSouthDependencies({
      from: [`${application.id}`],
    });
  }, [application, fetchAllSouthDependencies]);

  // Applications

  const {
    data: applications,
    isFetching: isFetchingApplications,
    error: fetchErrorApplications,
  } = useFetchApplications();

  // Initial value

  useEffect(() => {
    if (northDependencies) {
      const north = northDependencies
        .filter((f) => f.to.id === application.id)
        .map((f) => dependencyToOption(f, northToStringFn));
      setNorthboundDependencies(north);
    }
  }, [application, northDependencies]);

  useEffect(() => {
    if (southDependencies) {
      const south = southDependencies
        .filter((f) => f.from.id === application.id)
        .map((f) => dependencyToOption(f, southToStringFn));
      setSouthboundDependencies(south);
    }
  }, [application, southDependencies]);

  const savingMsg = (
    <div className="pf-v5-u-font-size-sm">
      <Spinner size="sm" /> {`${t("message.savingSelection")}...`}
    </div>
  );
  const existingDependencyMappings = southboundDependencies
    .map((sbd) => sbd.value.to.id)
    .concat(northboundDependencies.map((nbd) => nbd.value.from.id));

  return (
    <Form>
      <TextContent>
        <Text component="p">{t("message.manageDependenciesInstructions")}</Text>
      </TextContent>

      <FormGroup
        // t("terms.northboundDependencies")
        label={t("composed.add", {
          what: t("terms.northboundDependencies").toLowerCase(),
        })}
        fieldId="northbound-dependencies"
        isRequired={false}
      >
        <SelectDependency
          toggleAriaLabel="northbound-dependencies-toggle"
          toggleId="northbound-dependencies-toggle"
          fieldId="northbound-dependencies"
          toStringFn={northToStringFn}
          value={northboundDependencies}
          setValue={setNorthboundDependencies}
          options={(applications || [])
            .filter((f) => f.id !== application.id)
            .filter((app) => {
              return !existingDependencyMappings?.includes(app.id);
            })
            .map((f) =>
              dependencyToOption({ from: f, to: application }, northToStringFn)
            )}
          isFetching={isFetchingApplications || isFetchingNorthDependencies}
          fetchError={fetchErrorApplications || fetchErrorNorthDependencies}
          isSaving={isNorthBeingSaved}
          setIsSaving={setIsNorthBeingSaved}
          saveError={northSaveError}
          setSaveError={setNorthSaveError}
        />
        {northSaveError &&
          isNorthBeingSaved === getAxiosErrorMessage(northSaveError) && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem>{savingMsg}</HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
      </FormGroup>
      <FormGroup
        // t("terms.southboundDependencies")
        label={t("composed.add", {
          what: t("terms.southboundDependencies").toLowerCase(),
        })}
        fieldId="southbound-dependencies"
        isRequired={false}
      >
        <SelectDependency
          toggleAriaLabel="southbound-dependencies-toggle"
          fieldId="southbound-dependencies"
          toggleId="southbound-dependencies-toggle"
          toStringFn={southToStringFn}
          value={southboundDependencies}
          setValue={setSouthboundDependencies}
          options={(applications || [])
            .filter((f) => f.id !== application.id)
            .filter((app) => {
              return !existingDependencyMappings?.includes(app.id);
            })
            .map((f) =>
              dependencyToOption({ from: application, to: f }, southToStringFn)
            )}
          isFetching={isFetchingApplications || isFetchingSouthDependencies}
          fetchError={fetchErrorApplications || fetchErrorSouthDependencies}
          isSaving={isSouthBeingSaved}
          setIsSaving={setIsSouthBeingSaved}
          saveError={southSaveError}
          setSaveError={setSouthSaveError}
        />
        {southSaveError &&
          isSouthBeingSaved === getAxiosErrorMessage(southSaveError) && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem>{savingMsg}</HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
      </FormGroup>

      <ActionGroup>
        <Button
          type="button"
          id="application-dependencies-close"
          aria-label="close"
          variant={ButtonVariant.primary}
          onClick={onCancel}
          isDisabled={isNorthBeingSaved || isSouthBeingSaved}
        >
          {t("actions.close")}
        </Button>
      </ActionGroup>
    </Form>
  );
};
