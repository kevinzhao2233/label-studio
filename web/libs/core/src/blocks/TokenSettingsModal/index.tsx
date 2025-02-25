import { useAtomValue } from "jotai";
import { settingsAtom, TOKEN_SETTINGS_KEY } from "@humansignal/core/pages/AccountSettings/atoms";
import { queryClientAtom } from "jotai-tanstack-query";
import { useRef } from "react";

import { Form, Input, Toggle } from "apps/labelstudio/src/components/Form";
import { Button } from "apps/labelstudio/src/components/Button/Button";

export const TokenSettingsModal = ({
  showTTL,
}: {
  showTTL?: boolean;
}) => {
  const settings = useAtomValue(settingsAtom);
  const queryClient = useAtomValue(queryClientAtom);
  const formRef = useRef<Form>();
  const reloadSettings = () => {
    queryClient.invalidateQueries({ queryKey: [TOKEN_SETTINGS_KEY] });
  };
  if (!settings.isSuccess || settings.isError) {
    return <div>Error loading settings.</div>;
  }
  if ("error" in settings.data) {
    return <div>Error loading settings.</div>;
  }
  return (
    <Form ref={formRef} action="accessTokenUpdateSettings" onSubmit={reloadSettings}>
      <Form.Row columnCount={1}>
        <Toggle
          label="Personal Access Tokens"
          name="api_tokens_enabled"
          description="Enable increased token authentication security"
          checked={settings.data?.api_tokens_enabled ?? false}
        />
      </Form.Row>
      <Form.Row columnCount={1}>
        <Toggle
          label="Legacy Tokens"
          name="legacy_api_tokens_enabled"
          description="Enable legacy access tokens"
          checked={settings.data?.legacy_api_tokens_enabled}
        />
      </Form.Row>
      {showTTL === true && (
        <Form.Row columnCount={1}>
          <Input
            name="api_token_ttl_days"
            label="Personal Access Token Time-to-Live"
            description="The number of days, after creation, that the token will be valid for. After this time period a user will need to create a new access token"
            labelProps={{
              description:
                "The number of days, after creation, that the token will be valid for. After this time period a user will need to create a new access token",
            }}
            disabled={!settings.data?.api_tokens_enabled}
            type="number"
            min={10}
            max={365}
            value={settings.data?.time_to_live ?? 30}
          />
        </Form.Row>
      )}
      <Form.Actions>
        <Form.Indicator />
        <Button type="submit">Save</Button>
      </Form.Actions>
    </Form>
  );
};
