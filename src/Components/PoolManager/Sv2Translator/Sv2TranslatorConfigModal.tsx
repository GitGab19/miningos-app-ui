import Button from 'antd/es/button'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import Tabs from 'antd/es/tabs'
import { FormikProvider, useFormik } from 'formik'
import type { FC } from 'react'
import { useState } from 'react'
import * as yup from 'yup'

import {
  FieldHint,
  FieldLabel,
  FieldRow,
  FormActions,
  FormField,
  LogsContainer,
  ModalBody,
  PresetCard,
  PresetDetails,
  PresetGrid,
  PresetName,
  Section,
  SectionTitle,
  StyledModal,
} from './Sv2TranslatorConfigModal.styles'

import {
  useGetSv2TranslatorConfigQuery,
  useGetSv2TranslatorLogsQuery,
  useUpdateSv2TranslatorConfigMutation,
} from '@/app/services/api'
import { SV2_POOL_PRESETS, SV2_TRANSLATOR_DEFAULTS } from '@/Components/PoolManager/PoolManager.constants'
import { Spinner } from '@/Components/Spinner/Spinner'

const validationSchema = yup.object({
  upstreamAddress: yup.string().required('Upstream address is required'),
  upstreamPort: yup.number().required('Upstream port is required').min(1).max(65535),
  authorityPubkey: yup.string().required('Authority public key is required'),
  userIdentity: yup.string().required('User identity is required'),
  downstreamPort: yup.number().required('Downstream port is required').min(1).max(65535),
})

interface Sv2TranslatorConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (config: FormValues) => void
}

interface FormValues {
  upstreamAddress: string
  upstreamPort: number
  authorityPubkey: string
  userIdentity: string
  downstreamPort: number
  monitoringPort: number
  sharesPerMinute: number
  enableVardiff: boolean
}

export const Sv2TranslatorConfigModal: FC<Sv2TranslatorConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('config')

  const { data: config, isLoading: isConfigLoading } = useGetSv2TranslatorConfigQuery(undefined, {
    skip: !isOpen,
  })

  const { data: logsData, isLoading: isLogsLoading } = useGetSv2TranslatorLogsQuery(
    { tail: 100 },
    {
      skip: !isOpen || activeTab !== 'logs',
      pollingInterval: activeTab === 'logs' ? 3000 : 0,
    },
  )

  const [updateConfig, { isLoading: isUpdating }] = useUpdateSv2TranslatorConfigMutation()

  const formik = useFormik<FormValues>({
    initialValues: {
      upstreamAddress: config?.translator?.upstreams?.[0]?.address ?? SV2_POOL_PRESETS[0].address,
      upstreamPort: config?.translator?.upstreams?.[0]?.port ?? SV2_POOL_PRESETS[0].port,
      authorityPubkey:
        config?.translator?.upstreams?.[0]?.authorityPubkey ?? SV2_POOL_PRESETS[0].authorityPubkey,
      userIdentity: config?.translator?.userIdentity ?? SV2_TRANSLATOR_DEFAULTS.userIdentity,
      downstreamPort:
        config?.translator?.downstreamPort ?? SV2_TRANSLATOR_DEFAULTS.downstreamPort,
      monitoringPort:
        config?.deployment?.hostMonitoringPort ?? SV2_TRANSLATOR_DEFAULTS.monitoringPort,
      sharesPerMinute: config?.translator?.downstreamDifficultyConfig?.sharesPerMinute ?? 6.0,
      enableVardiff: config?.translator?.downstreamDifficultyConfig?.enableVardiff ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateConfig({
          config: {
            deployment: {
              hostDownstreamPort: values.downstreamPort,
              hostMonitoringPort: values.monitoringPort,
            },
            translator: {
              downstreamPort: values.downstreamPort,
              userIdentity: values.userIdentity,
              upstreams: [
                {
                  address: values.upstreamAddress,
                  port: values.upstreamPort,
                  authorityPubkey: values.authorityPubkey,
                },
              ],
              downstreamDifficultyConfig: {
                sharesPerMinute: values.sharesPerMinute,
                enableVardiff: values.enableVardiff,
              },
            },
          },
        }).unwrap()

        onSave?.(values)
        onClose()
      } catch (err) {
        console.error('Failed to update translator config:', err)
      }
    },
  })

  const handlePresetSelect = (index: number) => {
    setSelectedPreset(index)
    const preset = SV2_POOL_PRESETS[index]
    formik.setValues({
      ...formik.values,
      upstreamAddress: preset.address,
      upstreamPort: preset.port,
      authorityPubkey: preset.authorityPubkey,
    })
  }

  const tabItems = [
    {
      key: 'config',
      label: 'Configuration',
      children: (
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <Section>
                <SectionTitle>Pool Presets</SectionTitle>
                <PresetGrid>
                  {SV2_POOL_PRESETS.map((preset, index) => (
                    <PresetCard
                      key={preset.name}
                      $selected={selectedPreset === index}
                      onClick={() => handlePresetSelect(index)}
                    >
                      <PresetName>{preset.name}</PresetName>
                      <PresetDetails>
                        {preset.address}:{preset.port}
                      </PresetDetails>
                    </PresetCard>
                  ))}
                </PresetGrid>
              </Section>

              <Section>
                <SectionTitle>Upstream Pool (SV2)</SectionTitle>
                <FieldRow>
                  <FormField>
                    <FieldLabel>Address</FieldLabel>
                    <Input
                      name="upstreamAddress"
                      value={formik.values.upstreamAddress}
                      onChange={formik.handleChange}
                      placeholder="pool.example.com"
                    />
                  </FormField>
                  <FormField>
                    <FieldLabel>Port</FieldLabel>
                    <InputNumber
                      name="upstreamPort"
                      value={formik.values.upstreamPort}
                      onChange={(val) => formik.setFieldValue('upstreamPort', val)}
                      min={1}
                      max={65535}
                      style={{ width: '100%' }}
                    />
                  </FormField>
                </FieldRow>
                <FormField>
                  <FieldLabel>Authority Public Key</FieldLabel>
                  <Input
                    name="authorityPubkey"
                    value={formik.values.authorityPubkey}
                    onChange={formik.handleChange}
                    placeholder="Pool's authority public key"
                  />
                  <FieldHint>The pool's authority public key for SV2 authentication</FieldHint>
                </FormField>
              </Section>

              <Section>
                <SectionTitle>Translator Settings</SectionTitle>
                <FormField>
                  <FieldLabel>User Identity</FieldLabel>
                  <Input
                    name="userIdentity"
                    value={formik.values.userIdentity}
                    onChange={formik.handleChange}
                    placeholder="your_worker_name"
                  />
                  <FieldHint>Your mining identity (worker name prefix)</FieldHint>
                </FormField>
                <FieldRow>
                  <FormField>
                    <FieldLabel>Downstream Port (SV1 Miners)</FieldLabel>
                    <InputNumber
                      name="downstreamPort"
                      value={formik.values.downstreamPort}
                      onChange={(val) => formik.setFieldValue('downstreamPort', val)}
                      min={1}
                      max={65535}
                      style={{ width: '100%' }}
                    />
                    <FieldHint>Port miners connect to</FieldHint>
                  </FormField>
                  <FormField>
                    <FieldLabel>Monitoring Port</FieldLabel>
                    <InputNumber
                      name="monitoringPort"
                      value={formik.values.monitoringPort}
                      onChange={(val) => formik.setFieldValue('monitoringPort', val)}
                      min={1}
                      max={65535}
                      style={{ width: '100%' }}
                    />
                    <FieldHint>Metrics endpoint port</FieldHint>
                  </FormField>
                </FieldRow>
              </Section>

              <FormActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isUpdating || formik.isSubmitting}
                >
                  Save Configuration
                </Button>
              </FormActions>
            </ModalBody>
          </form>
        </FormikProvider>
      ),
    },
    {
      key: 'logs',
      label: 'Logs',
      children: (
        <ModalBody>
          <Section>
            <SectionTitle>Container Logs</SectionTitle>
            {isLogsLoading ? (
              <Spinner />
            ) : (
              <LogsContainer>{logsData?.logs ?? 'No logs available'}</LogsContainer>
            )}
          </Section>
        </ModalBody>
      ),
    },
  ]

  return (
    <StyledModal
      title="SV2 Translator Configuration"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      {isConfigLoading ? (
        <Spinner />
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      )}
    </StyledModal>
  )
}

export default Sv2TranslatorConfigModal
