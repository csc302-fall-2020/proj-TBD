import {Col, Layout, Radio, Row, Typography, Button, Space, Input, Spin, Alert} from 'antd';
import React, {useState} from 'react';
import axios, {AxiosError} from 'axios'

const {Content} = Layout
const {Text} = Typography
const {TextArea} = Input;

type ApiResponse = {
    data: string,
    error?: string
}

export type ApiTesterProps = { defaultRoute?: string }

const ApiTester: React.FC<ApiTesterProps> = ({defaultRoute}) => {
    const [route, setRoute] = useState(defaultRoute)
    const [requestMode, setRequestMode] = useState<'get' | 'post'>('get')
    const [requestBody, setRequestBody] = useState('{}');
    const [response, setResponse] = useState<ApiResponse | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const makeRequest = async () => {
        if (loading) return;

        setLoading(true);
        const url = `/${route}`
        let data = ''
        let error: string | undefined
        try {
            const response = await axios(url, {
                method: requestMode,
                headers: {
                    'content-type': 'application/json'
                },
                data: requestMode === 'post' ? JSON.parse(requestBody) : undefined
            })

            if (response.headers['content-type'] === 'application/json') {
                data = JSON.stringify(response.data, undefined, '  ')
            } else {
                data = `${response.data}`;
            }

        } catch (e) {
            if (e.isAxiosError) {
                const axiosError = e as AxiosError;
                data = JSON.stringify(axiosError.toJSON(), undefined, '  ');
                error = axiosError.message
            } else {
                error = `${e}`;
            }
        } finally {
            setLoading(false);
            setResponse({
                data,
                error
            })
        }
    }

    return (
        <Layout style={{height: '100vh', overflow: 'auto'}}>
            <Content>
                <Row justify='center' style={{margin: '32px 32px'}}>
                    <Col xs={12} style={{backgroundColor: '#fff', padding: '16px'}}>
                        <h3>Route Tester</h3>
                        <Space direction={'vertical'} style={{width: '100%'}}>
                            <Row>
                                <Col flex='auto'>
                                    <Space size='small'>
                                        {<Text type='secondary'>/</Text>}
                                        <Input
                                            type='text'
                                            style={{maxWidth: '200px'}}
                                            value={route}
                                            onChange={(e) => setRoute(e.target.value)}/>
                                    </Space>
                                </Col>
                                <Col>
                                    <Space>
                                        <Radio.Group
                                            value={requestMode}
                                            onChange={(e) => {
                                                setRequestMode(e.target.value)
                                                setResponse(undefined)
                                            }}>
                                            <Radio.Button value='get'>GET</Radio.Button>
                                            <Radio.Button value='post'>POST</Radio.Button>

                                        </Radio.Group>
                                        {loading ? <Spin/> : <Button type='primary' onClick={() => makeRequest()}>
                                            Go
                                        </Button>}
                                    </Space>
                                </Col>
                            </Row>
                            {requestMode === 'post' && <div>
                                <h4>Body</h4>
                                <TextArea
                                    rows={5}
                                    autoSize
                                    value={requestBody}
                                    onChange={(e) => setRequestBody(e.target.value)}/>
                            </div>}
                            {!loading && !!response && <>
                                {!!response.error && <Alert message={response.error} type={'error'}/>}
                                {!!response.data && <TextArea value={response.data} autoSize disabled/>}
                            </>}
                        </Space>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}

export default ApiTester