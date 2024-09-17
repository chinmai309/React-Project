import React, { useEffect, useState, Suspense, startTransition } from 'react';
import { DashboardOutlined,TeamOutlined, RightCircleFilled, FormOutlined, CommentOutlined, UserOutlined, ProductOutlined, CameraOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout, Menu, Card, Col, Row, Button, Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { postsState, userState, albumsState, photosState, collapsedState, displayPostsState, latestPostsSelector, filteredAlbumsSelector, filteredPhotosSelector, userSelector } from './state';
import { createStyles } from 'antd-style';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const useStyle = createStyles(({ prefixCls, css }) => ({
  gradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      border-width: 0;
      > span {
        position: relative;
      }
      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }
      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));

const Dashboard = () => {
  const [posts, setPosts] = useRecoilState(postsState);
  const albums = useRecoilValue(filteredAlbumsSelector);
  const photos = useRecoilValue(filteredPhotosSelector);
  const user = useRecoilValue(userSelector);
  const [collapsed, setCollapsed] = useRecoilState(collapsedState);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { styles } = useStyle();
  

  useEffect(() => {
    const fetchAndCombinePosts = async () => {
      try {
        // Fetch posts from local storage
        const storedPosts = localStorage.getItem('posts');
        let localPosts = [];
        if (storedPosts) {
          try {
            localPosts = JSON.parse(storedPosts);
          } catch (error) {
            console.error('Error parsing posts from local storage:', error);
          }
        }

        // Fetch posts from API
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=4');
        const apiPosts = await response.json();

        // Combine posts (API posts first, to prioritize API data over local storage)
        const combinedPosts = [...localPosts, ...apiPosts];

        // Remove duplicates by filtering based on unique `id`
        const uniquePosts = combinedPosts.filter((post, index, self) =>
          index === self.findIndex(p => p.id === post.id)
        );

        // Sort the posts: place post with ID 1 last, and keep the rest in the same order
        const sortedPosts = uniquePosts.sort((a, b) => {
          if (a.id === 1) return 1;
          if (b.id === 1) return 1;
          return 0;
        });

        // Display only the first 4 posts
        setPosts(sortedPosts.slice(0, 4));

      } catch (error) {
        console.error('Error fetching or combining posts:', error);
      }
      finally {
        setLoading(false); // Set loading to false after data is processed
      }
    };

    fetchAndCombinePosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loader or placeholder while loading
  }
  

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login', { replace: true });
  };

  const handleClickPosts = () => {
    startTransition(() => {
      navigate("/posts");
    });
  };

  const handleClickAlbums = () => {
    startTransition(() => {
      navigate("/albums");
    });
  };

  const handleClickPhotos = () => {
    startTransition(() => {
      navigate("/photos");
    });
  };

  const truncateText = (text, lines = 3) => {
    const words = text.split(' ');
    const truncated = words.slice(0, lines * 10).join(' ') + (words.length > lines * 10 ? '...' : '');
    return truncated;
  };

  
  return (
    <Layout style={{ minHeight: '100vh'}}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 1 }}
      >
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}
          style={{fontSize: 16}}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined style={{fontSize: 18}}/>,
              label: <Link to="/dashboard">Dashboard</Link>,
            },
            {
              key: '2',
              icon: <FormOutlined style={{fontSize: 18}}/>,
              label: <Link to="/posts">Posts</Link>,
            },
            {
              key: '3',
              icon: <ProductOutlined style={{fontSize: 18}}/>,
              label: <Link to="/albums">Albums</Link>,
            },
            {
              key: '4',
              icon: <CommentOutlined style={{fontSize: 18}}/>,
              label: <Link to="/comments">Comments</Link>,
            },
            {
              key: '5',
              icon: <TeamOutlined style={{fontSize: 18}}/>,
              label: <Link to="/users">Users</Link>,
            },
          ]}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header
          style={{
            padding: 0,
            background: '#fff',
            minHeight: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0px 20px',
          }}
        >
          <Title level={1} style={{ margin: 0, fontFamily: 'cursive' }}>
            <DashboardOutlined style={{ fontSize: 35 }} /> Dashboard
          </Title>
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -20, marginRight: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: -10 }}>
                <UserOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
                <span style={{ fontSize: '16px' }}>{user.name}</span>
              </div>
              <Button
                type="primary"
                onClick={handleLogout}
                className={styles.gradientButton}  // Apply the gradient style here
              >
                Logout
              </Button>
            </div>
          )}
        </Header>
        <Content style={{ margin: '14px 16px', minHeight: 360, borderRadius: '8px', fontFamily: 'cursive' }}>
          <h1 style={{ color: '#0d374f' }}><FormOutlined /> Posts</h1>
          <div style={{ minHeight: 260, borderRadius: '8px' }}>
            <Row gutter={16}>
              {posts.map((post) => (
                <Col span={6} key={post.id}>
                  <Card
                    title={post.title}
                    bordered={false}
                    style={{ borderWidth: 2, borderColor: 'grey', backgroundColor: '#c5dbf0', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}
                  >
                    <div style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      WebkitLineClamp: 3,
                    }}>
                      {truncateText(post.body)}
                    </div>
                  </Card>
                </Col>
              ))}
              <Col span={6} />
              <Col span={6} />
              <Col span={6} />
              <Col span={6}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px', color: '#0d4463' }}>
                  <span style={{ marginRight: '8px' }}>View All <FormOutlined /></span>
                  <Button type="primary" shape="circle" onClick={handleClickPosts} icon={<RightCircleFilled style={{ fontSize: 30 }} />} />
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={12}><h1 style={{ color: '#4f0d2b', fontFamily: 'cursive' }}><ProductOutlined /> Albums</h1></Col>
              <Col span={12}><h1 style={{ color: '#0d4f4c', fontFamily: 'cursive' }}><CameraOutlined /> Photos</h1></Col>
            </Row>
            {/* Albums */}
            <Row gutter={16} style={{ marginTop: 4 }}>
              <Col span={12} style={{ paddingRight: '8px', paddingLeft: '10px' }}>
                <Row gutter={16}>
                  {albums.map((album, index) => (
                    <Col span={12} key={album.id + index} style={{ paddingLeft: '5px' }}>
                      <Card
                        title={`Album Id: ${album.id}`}
                        bordered={false}
                        style={{ height: 213, borderWidth: 2, backgroundColor: '#edd3df', color: 'black', borderColor: 'grey', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', marginBottom: 10 }}
                      >
                        <div style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          WebkitLineClamp: 3,
                        }}>
                          {truncateText(album.title)}
                        </div>
                      </Card>
                    </Col>
                  ))}
                  <Col span={12} />
                  <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px', color: '#0d4463' }}>
                      <span style={{ marginRight: '8px' }}>View All <ProductOutlined /></span>
                      <Button type="primary" shape="circle" onClick={handleClickAlbums} icon={<RightCircleFilled style={{ fontSize: 30 }} />} />
                    </div>
                  </Col>
                </Row>
              </Col>
              {/* Photos */}
              <Col span={12} style={{ paddingLeft: '10px' }}>
                <Row gutter={12}>
                  {photos.map((photo, index) => (
                    <Col span={12} key={photo.id + index}>
                      <Card
                        cover={<img alt={photo.title} src={photo.thumbnailUrl} style={{ height: 120 }} />}
                        bordered={false}
                        style={{ borderWidth: 2, borderColor: 'grey', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', marginBottom: 10 }}
                      >
                        <div style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          WebkitLineClamp: 3,
                        }}>
                          {truncateText(photo.title)}
                        </div>
                      </Card>
                    </Col>
                  ))}
                  <Col span={12} />
                  <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px', color: '#0d4463' }}>
                      <span style={{ marginRight: '8px' }}>View All <CameraOutlined /></span>
                      <Button type="primary" shape="circle" onClick={handleClickPhotos} icon={<RightCircleFilled style={{ fontSize: 30 }} />} />
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>

  );
};

export default Dashboard;
