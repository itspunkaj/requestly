import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Input, Row } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import APP_CONSTANTS from "config/constants";
import deleteObjectAtPath from "../../../Filters/actions/deleteObjectAtPath";
import { setCurrentlySelectedRule } from "components/features/rules/RuleBuilder/actions";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { debounce, snakeCase } from "lodash";
import { ResponseRuleResourceType } from "types/rules";
import {
  trackRequestPayloadKeyFilterModifiedEvent,
  trackRequestPayloadValueFilterModifiedEvent,
} from "modules/analytics/events/common/rules/filters";
import "./GraphqlRequestPayload.css";

const {
  PATH_FROM_PAIR: {
    SOURCE_REQUEST_PAYLOAD,
    SOURCE_REQUEST_PAYLOAD_KEY,
    SOURCE_REQUEST_PAYLOAD_VALUE,
  },
} = APP_CONSTANTS;

const debouncedTrackPayloadKeyModifiedEvent = debounce(
  trackRequestPayloadKeyFilterModifiedEvent,
  500
);

const debouncedTrackPayloadValueModifiedEvent = debounce(
  trackRequestPayloadValueFilterModifiedEvent,
  500
);

type RequestPayload = { key: string; value: string };

interface GraphqlRequestPayloadProps {
  pairIndex: number;
  gqlOperationFilter: RequestPayload;
  setGqlOperationFilter: React.Dispatch<React.SetStateAction<RequestPayload>>;
  modifyPairAtGivenPath: (
    e: React.ChangeEvent<HTMLInputElement>,
    pairIndex: number,
    payloadPath: string,
    customValue?: string | unknown,
    otherValuesToModify?: { path: string; value: string | unknown }[],
    triggerUnsavedChangesIndication?: boolean
  ) => void;
}

const GraphqlRequestPayload: React.FC<GraphqlRequestPayloadProps> = ({
  pairIndex,
  gqlOperationFilter,
  setGqlOperationFilter,
  modifyPairAtGivenPath = () => {},
}) => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isRequestPayloadFilterCompatible = isFeatureCompatible(
    FEATURES.REQUEST_PAYLOAD_FILTER
  );

  useEffect(() => {
    if (gqlOperationFilter.key && gqlOperationFilter.value) {
      modifyPairAtGivenPath(
        null,
        pairIndex,
        SOURCE_REQUEST_PAYLOAD_KEY,
        gqlOperationFilter.key,
        [
          {
            path: "source.filters[0].requestPayload.value",
            value: gqlOperationFilter.value,
          },
        ],
        false
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gqlOperationFilter]);

  const clearRequestPayload = () => {
    deleteObjectAtPath(
      currentlySelectedRuleData,
      setCurrentlySelectedRule,
      SOURCE_REQUEST_PAYLOAD,
      pairIndex,
      dispatch
    );
  };

  const handleRequestPayloadKeyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    modifyPairAtGivenPath(e, pairIndex, SOURCE_REQUEST_PAYLOAD_KEY);
    const key = e.target.value;

    if (key === "") {
      clearRequestPayload();
    }

    setGqlOperationFilter((prev) => ({ ...prev, key }));
    debouncedTrackPayloadKeyModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRuleResourceType.GRAPHQL_API)
    );
  };

  const handleRequestPayloadValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    modifyPairAtGivenPath(e, pairIndex, SOURCE_REQUEST_PAYLOAD_VALUE);
    const value = e.target.value;

    if (value === "") {
      clearRequestPayload();
    }

    setGqlOperationFilter((prev) => ({ ...prev, value }));
    debouncedTrackPayloadValueModifiedEvent(
      currentlySelectedRuleData.ruleType,
      snakeCase(ResponseRuleResourceType.GRAPHQL_API)
    );
  };

  return isRequestPayloadFilterCompatible ? (
    <>
      <label className="subtitle graphql-operation-label">
        GraphQL Operation
        <a
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer"
          href={APP_CONSTANTS.LINKS.REQUESTLY_DOCS_MOCK_GRAPHQL}
        >
          <InfoCircleOutlined />
        </a>
      </label>
      <Row wrap={false}>
        <Input
          name="key"
          type="text"
          autoComplete="off"
          placeholder="key"
          className="graphql-operation-type-input"
          value={gqlOperationFilter.key}
          onChange={handleRequestPayloadKeyChange}
        />
        <Input
          name="value"
          type="text"
          autoComplete="off"
          placeholder="value"
          className="graphql-operation-type-name"
          value={gqlOperationFilter.value}
          onChange={handleRequestPayloadValueChange}
        />
      </Row>
    </>
  ) : null;
};

export default GraphqlRequestPayload;