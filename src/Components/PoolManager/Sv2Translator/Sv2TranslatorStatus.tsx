import { ThunderboltOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Switch from 'antd/es/switch'
import Tooltip from 'antd/es/tooltip'
import type { FC } from 'react'
import { useState } from 'react'

import {
  ButtonRow,
  ConfigLabel,
  ConfigRow,
  ConfigSection,
  ConfigValue,
  Description,
  ErrorText,
  ExpandButton,
  Header,
  HeaderLeft,
  PortBadge,
  StatusDot,
  StatusRow,
  StatusText,
  Title,
  TranslatorCard,
} from './Sv2TranslatorStatus.styles'

import {
  useGetSv2TranslatorStatusQuery,
  useStartSv2TranslatorMutation,
  useStopSv2TranslatorMutation,
} from '@/app/services/api'
import type { Sv2TranslatorConfig } from '@/types/api'

interface Sv2TranslatorStatusProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  onConfigure?: () => void
  upstream?: {
    address: string
    port: number
    authorityPubkey: string
  }
  userIdentity?: string
}

export const Sv2TranslatorStatus: FC<Sv2TranslatorStatusProps> = ({
  enabled,
  onToggle,
  onConfigure,
  upstream,
  userIdentity,
}) => {
  const [expanded, setExpanded] = useState(false)

  const {
    data: status,
    isLoading: isStatusLoading,
    error: statusError,
  } = useGetSv2TranslatorStatusQuery(undefined, {
    pollingInterval: enabled ? 5000 : 0, // Poll every 5s when enabled
    skip: !enabled,
  })

  const [startTranslator, { isLoading: isStarting }] = useStartSv2TranslatorMutation()
  const [stopTranslator, { isLoading: isStopping }] = useStopSv2TranslatorMutation()

  const isRunning = status?.running ?? false
  const isActionLoading = isStarting || isStopping

  const handleStart = async () => {
    const config: Partial<Sv2TranslatorConfig> = {}

    if (upstream) {
      config.translator = {
        upstreams: [upstream],
        ...(userIdentity && { userIdentity }),
      }
    }

    try {
      await startTranslator(Object.keys(config).length > 0 ? { config } : {}).unwrap()
    } catch (err) {
      console.error('Failed to start SV2 translator:', err)
    }
  }

  const handleStop = async () => {
    try {
      await stopTranslator().unwrap()
    } catch (err) {
      console.error('Failed to stop SV2 translator:', err)
    }
  }

  const handleToggle = (checked: boolean) => {
    onToggle(checked)
    if (checked && !isRunning) {
      handleStart()
    } else if (!checked && isRunning) {
      handleStop()
    }
  }

  return (
    <TranslatorCard>
      <Header>
        <HeaderLeft>
          <ThunderboltOutlined style={{ fontSize: 18, color: '#faad14' }} />
          <Title>SV2 Translator Proxy</Title>
        </HeaderLeft>
        <Tooltip title={enabled ? 'Disable translator' : 'Enable translator'}>
          <Switch
            checked={enabled}
            onChange={handleToggle}
            loading={isActionLoading}
            size="small"
          />
        </Tooltip>
      </Header>

      <Description>
        Converts Stratum V1 to V2 protocol, allowing legacy miners to connect to SV2 pools with
        improved efficiency and security.
      </Description>

      {enabled && (
        <>
          <StatusRow>
            <StatusDot $running={isRunning} />
            <StatusText $running={isRunning}>
              {isStatusLoading
                ? 'Checking status...'
                : isRunning
                  ? `Running on port ${status?.ports?.downstream ?? 34255}`
                  : 'Not running'}
            </StatusText>
            {isRunning && status?.ports?.downstream && (
              <PortBadge>:{status.ports.downstream}</PortBadge>
            )}
          </StatusRow>

          {statusError && <ErrorText>Failed to get translator status</ErrorText>}

          <ButtonRow>
            {!isRunning ? (
              <Button size="small" type="primary" onClick={handleStart} loading={isStarting}>
                Start Translator
              </Button>
            ) : (
              <Button size="small" danger onClick={handleStop} loading={isStopping}>
                Stop Translator
              </Button>
            )}
            {onConfigure && (
              <Button size="small" onClick={onConfigure}>
                Configure
              </Button>
            )}
            <ExpandButton onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Hide details' : 'Show details'}
            </ExpandButton>
          </ButtonRow>

          <ConfigSection $expanded={expanded}>
            {upstream && (
              <>
                <ConfigRow>
                  <ConfigLabel>Upstream Pool</ConfigLabel>
                  <ConfigValue>
                    {upstream.address}:{upstream.port}
                  </ConfigValue>
                </ConfigRow>
                <ConfigRow>
                  <ConfigLabel>Authority Pubkey</ConfigLabel>
                  <ConfigValue title={upstream.authorityPubkey}>
                    {upstream.authorityPubkey.slice(0, 16)}...
                  </ConfigValue>
                </ConfigRow>
              </>
            )}
            {userIdentity && (
              <ConfigRow>
                <ConfigLabel>User Identity</ConfigLabel>
                <ConfigValue>{userIdentity}</ConfigValue>
              </ConfigRow>
            )}
            <ConfigRow>
              <ConfigLabel>Miner Connection</ConfigLabel>
              <ConfigValue>stratum+tcp://localhost:{status?.ports?.downstream ?? 34255}</ConfigValue>
            </ConfigRow>
          </ConfigSection>
        </>
      )}
    </TranslatorCard>
  )
}

export default Sv2TranslatorStatus
