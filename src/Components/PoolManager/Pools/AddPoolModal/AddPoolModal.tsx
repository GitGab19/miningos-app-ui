import { CheckSquareFilled, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import Radio from 'antd/es/radio'
import Tooltip from 'antd/es/tooltip'
import { FormikProvider, useFormik } from 'formik'
import _pullAt from 'lodash/pullAt'
import { useState } from 'react'
import * as yup from 'yup'

import {
  FieldLabel,
  FormActions,
  FormField,
  FormSectionHeader,
  ModalBody,
  ModalTitle,
  StyledModal,
} from '../../PoolManager.common.styles'
import {
  POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_OPTIONS,
  POOL_PROTOCOLS,
  SV2_POOL_PRESETS,
  type PoolProtocol,
} from '../../PoolManager.constants'
import { Sv2TranslatorStatus } from '../../Sv2Translator/Sv2TranslatorStatus'
import { Sv2TranslatorConfigModal } from '../../Sv2Translator/Sv2TranslatorConfigModal'
import { AddPoolEndpointModal } from '../AddPoolEndpointModal/AddPoolEndpointModal'

import {
  EndpointFields,
  EndpointFieldValue,
  EndpointHeader,
  EndpointPointRole,
  EndpointsSection,
  EndpointsSectionHeader,
  EndpointsWrapper,
  EndpointWrapper,
  FieldRow,
  ProtocolBadge,
  ProtocolLabel,
  ProtocolOption,
  ProtocolSelectorSection,
  SectionHeader,
  SectionHeaderTitle,
  Sv2UpstreamSection,
  TranslatorSection,
  ValidationStatus,
  ValidationStatusIcon,
  ValidationStatusIndicator,
  ValidationStatusSection,
  ValidationStatusWrapper,
} from './AddPoolModal.styles'

import { FormikInput, FormikSelect } from '@/Components/FormInputs'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'
import { useContextualModal } from '@/hooks/useContextualModal'

const sv1ValidationSchema = yup.object({
  groupName: yup.string().required('Group name is required'),
  workerName: yup.string(),
  suffixType: yup.string().nullable(),
})

const sv2ValidationSchema = yup.object({
  groupName: yup.string().required('Group name is required'),
  sv2Address: yup.string().required('Upstream address is required'),
  sv2Port: yup.number().required('Upstream port is required').min(1).max(65535),
  sv2AuthorityPubkey: yup.string().required('Authority public key is required'),
  userIdentity: yup.string().required('User identity is required'),
  workerName: yup.string(),
  suffixType: yup.string().nullable(),
})

interface Endpoint {
  role: string
  host: string
  port: string
  region: string
}

interface FormValues {
  protocol: PoolProtocol
  groupName: string
  description: string
  workerName: string
  suffixType: string | null
  // SV1 fields
  endpoints: Endpoint[]
  // SV2 fields
  sv2Address: string
  sv2Port: number
  sv2AuthorityPubkey: string
  userIdentity: string
  translatorEnabled: boolean
}

interface AddPoolModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export const AddPoolModal = ({ isOpen, onClose }: AddPoolModalProps) => {
  const isLoading = false
  const [translatorConfigOpen, setTranslatorConfigOpen] = useState(false)
  const [currentProtocol, setCurrentProtocol] = useState<PoolProtocol>(POOL_PROTOCOLS.STRATUM_V1)

  const formik = useFormik<FormValues>({
    initialValues: {
      protocol: POOL_PROTOCOLS.STRATUM_V1,
      groupName: '',
      description: '',
      workerName: '',
      suffixType: null,
      // SV1 defaults
      endpoints: [],
      // SV2 defaults
      sv2Address: SV2_POOL_PRESETS[0].address,
      sv2Port: SV2_POOL_PRESETS[0].port,
      sv2AuthorityPubkey: SV2_POOL_PRESETS[0].authorityPubkey,
      userIdentity: 'miningos',
      translatorEnabled: true,
    },
    validationSchema:
      currentProtocol === POOL_PROTOCOLS.STRATUM_V2
        ? sv2ValidationSchema
        : sv1ValidationSchema,
    onSubmit: async (values) => {
      console.log('Pool configuration:', values)
      // TODO: Implement actual pool creation logic
      // For SV2 pools with translator enabled:
      // 1. Configure and start the translator with the SV2 upstream
      // 2. Set miners to connect to localhost:34255 (translator)
      onClose?.()
    },
  })

  const {
    modalOpen: addEndpointModalOpen,
    handleOpen: openAddEndpointModal,
    handleClose: closeAddEndpointModal,
  } = useContextualModal()

  const handleAddEndpointSubmit = (values: Endpoint) => {
    const { host, port, role, region } = values
    formik.setFieldValue('endpoints', [...formik.values.endpoints, { host, port, role, region }])
  }

  const deleteEndpointAtIndex = (index: number) => {
    _pullAt(formik.values.endpoints, [index])
    formik.setFieldValue('endpoints', [...formik.values.endpoints])
  }

  const handleProtocolChange = (protocol: PoolProtocol) => {
    setCurrentProtocol(protocol)
    formik.setFieldValue('protocol', protocol)
    // Auto-enable translator for SV2
    if (protocol === POOL_PROTOCOLS.STRATUM_V2) {
      formik.setFieldValue('translatorEnabled', true)
    }
  }

  const handlePresetSelect = (index: number) => {
    const preset = SV2_POOL_PRESETS[index]
    formik.setValues({
      ...formik.values,
      sv2Address: preset.address,
      sv2Port: preset.port,
      sv2AuthorityPubkey: preset.authorityPubkey,
    })
  }

  const isPoolValidated = false
  const poolValidationColor = isPoolValidated ? COLOR.GREEN : COLOR.RED
  const isSv2 = formik.values.protocol === POOL_PROTOCOLS.STRATUM_V2

  return (
    <StyledModal
      title={<ModalTitle>Add Pool Configuration</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={600}
      maskClosable={false}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              {/* Protocol Selection */}
              <ProtocolSelectorSection>
                <FormSectionHeader>PROTOCOL</FormSectionHeader>
                <Radio.Group
                  value={formik.values.protocol}
                  onChange={(e) => handleProtocolChange(e.target.value)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <ProtocolOption
                    $selected={formik.values.protocol === POOL_PROTOCOLS.STRATUM_V1}
                    onClick={() => handleProtocolChange(POOL_PROTOCOLS.STRATUM_V1)}
                  >
                    <Radio value={POOL_PROTOCOLS.STRATUM_V1} />
                    <ProtocolLabel>Stratum V1 (Legacy)</ProtocolLabel>
                  </ProtocolOption>
                  <ProtocolOption
                    $selected={formik.values.protocol === POOL_PROTOCOLS.STRATUM_V2}
                    onClick={() => handleProtocolChange(POOL_PROTOCOLS.STRATUM_V2)}
                  >
                    <Radio value={POOL_PROTOCOLS.STRATUM_V2} />
                    <ProtocolLabel>Stratum V2</ProtocolLabel>
                    <Tooltip title="Better efficiency, privacy, and decentralization">
                      <ProtocolBadge $recommended>Recommended</ProtocolBadge>
                    </Tooltip>
                  </ProtocolOption>
                </Radio.Group>
              </ProtocolSelectorSection>

              {/* Group Info */}
              <FormSectionHeader>GROUP INFO</FormSectionHeader>
              <FormField>
                <FieldLabel>Group Name</FieldLabel>
                <FormikInput name="groupName" />
              </FormField>

              {/* SV1 Endpoints Section */}
              {!isSv2 && (
                <EndpointsSection>
                  <EndpointsSectionHeader>
                    <FormSectionHeader>ENDPOINTS CONFIGURATION</FormSectionHeader>
                    <Button onClick={openAddEndpointModal}>Add Endpoint</Button>
                  </EndpointsSectionHeader>
                  <EndpointsWrapper>
                    {formik.values.endpoints.map((endpoint, index) => (
                      <EndpointWrapper key={index}>
                        <EndpointHeader>
                          <EndpointPointRole>{endpoint.role}</EndpointPointRole>
                          <Button
                            icon={<DeleteOutlined />}
                            onClick={() => deleteEndpointAtIndex(index)}
                          />
                        </EndpointHeader>
                        <EndpointFields>
                          <FormField>
                            <FieldLabel>Host</FieldLabel>
                            <EndpointFieldValue>{endpoint.host}</EndpointFieldValue>
                          </FormField>
                          <FormField>
                            <FieldLabel>Port</FieldLabel>
                            <EndpointFieldValue>{endpoint.port}</EndpointFieldValue>
                          </FormField>
                        </EndpointFields>
                      </EndpointWrapper>
                    ))}
                    {formik.values.endpoints.length === 0 && (
                      <EndpointWrapper>
                        <ProtocolLabel style={{ color: COLOR.GRAY, textAlign: 'center' }}>
                          No endpoints configured. Click "Add Endpoint" to add one.
                        </ProtocolLabel>
                      </EndpointWrapper>
                    )}
                  </EndpointsWrapper>
                </EndpointsSection>
              )}

              {/* SV2 Upstream Section */}
              {isSv2 && (
                <>
                  <Sv2UpstreamSection>
                    <FormSectionHeader>SV2 UPSTREAM POOL</FormSectionHeader>

                    {/* Pool Presets */}
                    <FieldRow>
                      {SV2_POOL_PRESETS.map((preset, index) => (
                        <Button
                          key={preset.name}
                          size="small"
                          type={
                            formik.values.sv2Address === preset.address ? 'primary' : 'default'
                          }
                          onClick={() => handlePresetSelect(index)}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </FieldRow>

                    <FieldRow>
                      <FormField>
                        <FieldLabel>Address</FieldLabel>
                        <Input
                          name="sv2Address"
                          value={formik.values.sv2Address}
                          onChange={formik.handleChange}
                          placeholder="pool.example.com"
                        />
                      </FormField>
                      <FormField>
                        <FieldLabel>Port</FieldLabel>
                        <InputNumber
                          name="sv2Port"
                          value={formik.values.sv2Port}
                          onChange={(val) => formik.setFieldValue('sv2Port', val)}
                          min={1}
                          max={65535}
                          style={{ width: '100%' }}
                        />
                      </FormField>
                    </FieldRow>

                    <FormField>
                      <FieldLabel>Authority Public Key</FieldLabel>
                      <Input
                        name="sv2AuthorityPubkey"
                        value={formik.values.sv2AuthorityPubkey}
                        onChange={formik.handleChange}
                        placeholder="Pool's authority public key"
                      />
                    </FormField>

                    <FormField>
                      <FieldLabel>User Identity (Worker Name Prefix)</FieldLabel>
                      <Input
                        name="userIdentity"
                        value={formik.values.userIdentity}
                        onChange={formik.handleChange}
                        placeholder="your_farm_name"
                      />
                    </FormField>
                  </Sv2UpstreamSection>

                  {/* SV2 Translator Section */}
                  <TranslatorSection>
                    <Sv2TranslatorStatus
                      enabled={formik.values.translatorEnabled}
                      onToggle={(enabled) => formik.setFieldValue('translatorEnabled', enabled)}
                      onConfigure={() => setTranslatorConfigOpen(true)}
                      upstream={{
                        address: formik.values.sv2Address,
                        port: formik.values.sv2Port,
                        authorityPubkey: formik.values.sv2AuthorityPubkey,
                      }}
                      userIdentity={formik.values.userIdentity}
                    />
                  </TranslatorSection>
                </>
              )}

              {/* Credentials Template */}
              <FormSectionHeader>CREDENTIALS TEMPLATE</FormSectionHeader>
              <FormField>
                <FieldLabel>Worker Name</FieldLabel>
                <FormikInput name="workerName" />
              </FormField>
              <FormField>
                <FieldLabel>Suffix Type</FieldLabel>
                <FormikSelect
                  name="suffixType"
                  options={POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_OPTIONS}
                />
              </FormField>

              {/* Validation Status */}
              <ValidationStatusSection>
                <SectionHeader>
                  <SectionHeaderTitle>Validation Status</SectionHeaderTitle>
                </SectionHeader>
                <ValidationStatusWrapper>
                  <ValidationStatusIndicator>
                    <ValidationStatusIcon $color={poolValidationColor}>
                      {isPoolValidated ? <CheckSquareFilled /> : <CloseCircleOutlined />}
                    </ValidationStatusIcon>
                    <ValidationStatus $color={poolValidationColor}>
                      {isPoolValidated
                        ? 'Configuration validated successfully'
                        : 'Configuration not validated'}
                    </ValidationStatus>
                  </ValidationStatusIndicator>
                  <Button>Test Configuration</Button>
                </ValidationStatusWrapper>
              </ValidationStatusSection>

              {/* Actions */}
              <FormActions>
                <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>
                  Save
                </Button>
                <Button onClick={onClose} disabled={formik.isSubmitting}>
                  Cancel
                </Button>
              </FormActions>
            </ModalBody>
          </form>
        </FormikProvider>
      )}

      {/* Sub-modals */}
      {addEndpointModalOpen && (
        <AddPoolEndpointModal
          isOpen={addEndpointModalOpen}
          onClose={closeAddEndpointModal}
          onSubmit={handleAddEndpointSubmit as (values: unknown) => void}
        />
      )}

      <Sv2TranslatorConfigModal
        isOpen={translatorConfigOpen}
        onClose={() => setTranslatorConfigOpen(false)}
      />
    </StyledModal>
  )
}
