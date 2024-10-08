import React, { useContext } from 'react';
import { Layout, Row, Col, theme } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import { collapsedState, currentPagePhotosState, currentPageState, photosWithAlbumsSelector, totalPhotosSelector } from './state';
import CustomHeader from '../assets/CustomHeader';
import CustomSider from '../assets/CustomSider';
import PaginationComponent from '../assets/PaginationComponent';
import CustomCardOne from '../assets/CustomCardOne';
import { ThemeContext } from './ThemeContext';

const { Content } = Layout;

const Photos = () => {
  const {
    backgroundImage,
  } = useContext(ThemeContext); // Use background image and heading colors from context

  const photos = useRecoilValue(photosWithAlbumsSelector);
  const totalPhotos = useRecoilValue(totalPhotosSelector);
  const [collapsed, setCollapsed] = useRecoilState(collapsedState);
  const [currentPage, setCurrentPage] = useRecoilState(currentPageState);

  const photosPerPage = 12; // Display 12 photos per page
  const photosPerRow = 4; // Number of photos per row

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh'}}>
      <CustomSider collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout
  style={{
    marginLeft: collapsed ? 80 : 200,
    minHeight: '100vh',
    backgroundColor: '#414a4c',
    position: 'relative',
    overflow: 'hidden', // Ensure content doesn't overflow past blurred background
  }}
>
  {/* Pseudo-element for background image */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      filter: 'blur(8px)', // Apply the blur here
    }}
  />
      <CustomHeader title="Photos" icon={<CameraOutlined />} titleColor='#0d4f4c' />
      <Content
        style={{
          padding: '0 48px',
        }}
      >
        <div
          style={{
            padding: 24,
            minHeight: 380,
            borderRadius: borderRadiusLG,
          }}
        >
          <Row gutter={[16, 16]}> {/* Add vertical and horizontal gutter spacing */}
            {photos.map(photo => (
              <Col span={24 / photosPerRow} key={photo.id}>
              <CustomCardOne
                title={photo.title}
                description={
                  <div>
                    {photo.album ? (
                      <>
                        <span>Album Id: {photo.album.id}</span><br />
                        <span>Album Title: {photo.album.title}</span><br />
                      </>
                    ) : (
                      <span>No album data available</span>
                    )}
                  </div>
                }
                coverSrc={photo.url}
                descriptionColor='#1d455c'

              />
              </Col>
            ))}
          </Row>
          <PaginationComponent
            pageSize={photosPerPage}
            total={totalPhotos}
            current={currentPage}
            onChange={(page) => setCurrentPage(page)} // Update the current page state
          />
        </div>
      </Content>
      </Layout>
    </Layout>
  );
};

export default Photos;
