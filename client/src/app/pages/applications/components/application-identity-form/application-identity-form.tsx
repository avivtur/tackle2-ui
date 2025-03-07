import React, { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import {
  ActionGroup,
  Button,
  ButtonVariant,
  Form,
  Text,
} from "@patternfly/react-core";
import WarningTriangleIcon from "@patternfly/react-icons/dist/esm/icons/warning-triangle-icon";
import { Application, Ref } from "@app/api/models";
import { DEFAULT_SELECT_MAX_HEIGHT } from "@app/Constants";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import { getKindIDByRef, toOptionLike } from "@app/utils/model-utils";
import {
  APPLICATION_NAME,
  MAVEN_SETTINGS,
  SOURCE_CREDENTIALS,
} from "./field-names";
import validationSchema from "./validation-schema";
import { updateApplication } from "@app/api/rest";
import { useUpdateAllApplicationsMutation } from "@app/queries/applications";
import { useFetchIdentities } from "@app/queries/identities";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  HookFormPFGroupController,
  HookFormPFTextInput,
} from "@app/components/HookFormPFFields";
import { OptionWithValue, SimpleSelect } from "@app/components/SimpleSelect";
import { NotificationsContext } from "@app/components/NotificationsContext";
import { getAxiosErrorMessage } from "@app/utils/utils";

export interface FormValues {
  applicationName: string;
  sourceCredentials: string;
  mavenSettings: string;
}

export interface ApplicationIdentityFormProps {
  applications: Application[];
  onClose: () => void;
}

export const ApplicationIdentityForm: React.FC<
  ApplicationIdentityFormProps
> = ({ applications, onClose }) => {
  const { t } = useTranslation();
  const { pushNotification } = React.useContext(NotificationsContext);

  const { identities } = useFetchIdentities();

  const sourceIdentityOptions = identities
    .filter((identity) => identity.kind === "source")
    .map((sourceIdentity) => {
      return {
        value: sourceIdentity.name,
        toString: () => sourceIdentity.name,
      };
    });
  const mavenIdentityOptions = identities
    .filter((identity) => identity.kind === "maven")
    .map((maven) => {
      return {
        value: maven.name,
        toString: () => maven.name,
      };
    });

  const onUpdateApplicationsSuccess = (response: []) => {
    pushNotification({
      title: t("toastr.success.numberOfSaved", {
        count: response.length,
        type: t("terms.application(s)").toLowerCase(),
      }),
      variant: "success",
    });
    onClose();
  };

  const onUpdateApplicationsError = (error: AxiosError) => {
    pushNotification({
      title: getAxiosErrorMessage(error),
      variant: "danger",
    });
  };

  const { mutate: updateAllApplications } = useUpdateAllApplicationsMutation(
    onUpdateApplicationsSuccess,
    onUpdateApplicationsError
  );

  const onSubmit = (formValues: FormValues) => {
    let updatePromises: Array<Promise<Application>> = [];
    applications.forEach((application) => {
      let updatedIdentities: Ref[] = [];
      if (application.identities && identities) {
        const matchingSourceCredential = identities.find(
          (identity) => identity.name === formValues.sourceCredentials
        );
        if (matchingSourceCredential) {
          updatedIdentities.push({
            name: matchingSourceCredential?.name || "",
            id: matchingSourceCredential.id,
          });
        }
        const matchingMavenSettings = identities.find(
          (identity) => identity.name === formValues.mavenSettings
        );
        if (matchingMavenSettings) {
          updatedIdentities.push({
            name: matchingMavenSettings?.name || "",
            id: matchingMavenSettings.id,
          });
        }
      }
      if (application) {
        const payload: Application = {
          name: application.name,
          identities: updatedIdentities,
          id: application.id,
          businessService: application.businessService,
          migrationWave: application.migrationWave,
        };
        let promise: Promise<Application>;
        promise = updateApplication({
          ...application,
          ...payload,
        });
        updatePromises.push(promise);
      }
    });
    updateAllApplications(updatePromises);
  };

  const getApplicationNames = (applications: Application[]) => {
    const listOfNames = applications.map((app: Application) => app.name);
    return listOfNames.join(", ");
  };

  const {
    handleSubmit,
    formState: { isSubmitting, isValidating, isValid, isDirty },
    getValues,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      [APPLICATION_NAME]: getApplicationNames(applications) || "",
      [SOURCE_CREDENTIALS]: getKindIDByRef(
        identities,
        applications[0],
        "source"
      )?.name,
      [MAVEN_SETTINGS]: getKindIDByRef(identities, applications[0], "maven")
        ?.name,
    },
    resolver: yupResolver(
      validationSchema({ [SOURCE_CREDENTIALS]: false, [MAVEN_SETTINGS]: false })
    ),
    mode: "onChange",
  });

  useEffect(() => {
    if (identities && applications) {
      const isExistingSourceCreds = applications.some((app) => {
        return getKindIDByRef(identities, app, "source");
      });
      const isExistingMavenCreds = applications.some((app) => {
        return getKindIDByRef(identities, app, "maven");
      });
      setExistingIdentitiesError(isExistingMavenCreds || isExistingSourceCreds);
    }
  }, [identities, getValues()]);
  const [existingIdentitiesError, setExistingIdentitiesError] = useState(false);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <HookFormPFTextInput
        control={control}
        name="applicationName"
        fieldId="application-name"
        aria-label="Manage credentials selected applications"
        readOnly
      />
      <HookFormPFGroupController
        control={control}
        name="sourceCredentials"
        label={"Source credentials"}
        fieldId={SOURCE_CREDENTIALS}
        renderInput={({ field: { value, name, onChange } }) => (
          <SimpleSelect
            maxHeight={DEFAULT_SELECT_MAX_HEIGHT}
            variant="typeahead"
            toggleId="source-credentials-toggle"
            id="source-credentials"
            toggleAriaLabel="Source credentials"
            aria-label={name}
            value={
              value ? toOptionLike(value, sourceIdentityOptions) : undefined
            }
            options={sourceIdentityOptions}
            onChange={(selection) => {
              const selectionValue = selection as OptionWithValue<string>;
              onChange(selectionValue.value);
            }}
            onClear={() => onChange("")}
          />
        )}
      />
      <HookFormPFGroupController
        control={control}
        name="mavenSettings"
        label={"Maven settings"}
        fieldId={MAVEN_SETTINGS}
        renderInput={({ field: { value, name, onChange } }) => (
          <SimpleSelect
            maxHeight={DEFAULT_SELECT_MAX_HEIGHT}
            variant="typeahead"
            toggleId="maven-settings-toggle"
            id="maven-settings"
            toggleAriaLabel="Maven settings"
            aria-label={name}
            value={
              value ? toOptionLike(value, mavenIdentityOptions) : undefined
            }
            options={mavenIdentityOptions}
            onChange={(selection) => {
              const selectionValue = selection as OptionWithValue<string>;
              onChange(selectionValue.value);
            }}
            onClear={() => onChange("")}
          />
        )}
      />
      <>
        {existingIdentitiesError && (
          <>
            <Text>
              <WarningTriangleIcon className={spacing.mrSm} color="orange" />
              One or more of the selected applications have already been
              assigned credentials. Any changes made will override the existing
              values.
            </Text>
          </>
        )}
      </>
      <ActionGroup>
        <Button
          type="submit"
          id="identity-form-submit"
          aria-label="submit"
          variant={ButtonVariant.primary}
          isDisabled={!isValid || isSubmitting || isValidating || !isDirty}
        >
          {t("actions.save")}
        </Button>
        <Button
          id="cancel"
          type="button"
          aria-label="cancel"
          variant={ButtonVariant.link}
          onClick={onClose}
        >
          {t("actions.cancel")}
        </Button>
      </ActionGroup>
    </Form>
  );
};
