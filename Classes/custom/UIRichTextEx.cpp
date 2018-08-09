#include "UIRichTextEx.h"
#include "base/CCEventListenerTouch.h"
#include "base/CCDirector.h"

#include "platform/CCFileUtils.h"
#include "2d/CCLabel.h"
#include "2d/CCSprite.h"
#include "base/ccUTF8.h"
#include "2d/CCLayer.h"

NS_CC_BEGIN

namespace ui {
    
static std::string utf8_substr(const std::string& str, unsigned long start, unsigned long leng)
{
    if (leng==0)
    {
        return "";
    }
    unsigned long c, i, ix, q, min=std::string::npos, max=std::string::npos;
    for (q=0, i=0, ix=str.length(); i < ix; i++, q++)
    {
        if (q==start)
        {
            min = i;
        }
        if (q <= start+leng || leng==std::string::npos)
        {
            max = i;
        }
        
        c = (unsigned char) str[i];
        
        if      (c<=127) i+=0;
        else if ((c & 0xE0) == 0xC0) i+=1;
        else if ((c & 0xF0) == 0xE0) i+=2;
        else if ((c & 0xF8) == 0xF0) i+=3;
        else return "";//invalid utf8
    }
    if (q <= start+leng || leng == std::string::npos)
    {
        max = i;
    }
    if (min==std::string::npos || max==std::string::npos)
    {
        return "";
    }
    return str.substr(min,max);
}

bool RichElementEx::init(int tag, const Color3B &color, GLubyte opacity)
{
    _tag = tag;
    _color = color;
    _opacity = opacity;
    return true;
}


RichElementTextEx* RichElementTextEx::create(int tag, const Color3B &color, GLubyte opacity, const std::string& text, const std::string& fontName, float fontSize)
{
    RichElementTextEx* element = new RichElementTextEx();
    if (element && element->init(tag, color, opacity, text, fontName, fontSize))
    {
        element->autorelease();
        return element;
    }
    CC_SAFE_DELETE(element);
    return nullptr;
}

bool RichElementTextEx::init(int tag, const Color3B &color, GLubyte opacity, const std::string& text, const std::string& fontName, float fontSize)
{
    if (RichElementEx::init(tag, color, opacity))
    {
        _text = text;
        _fontName = fontName;
        _fontSize = fontSize;
        return true;
    }
    return false;
}

RichElementImageEx* RichElementImageEx::create(int tag, const Color3B &color, GLubyte opacity, const std::string& filePath, TextureType textureType)
{
    RichElementImageEx* element = new RichElementImageEx();
    if (element && element->init(tag, color, opacity, filePath, textureType))
    {
        element->autorelease();
        return element;
    }
    CC_SAFE_DELETE(element);
    return nullptr;
}

bool RichElementImageEx::init(int tag, const Color3B &color, GLubyte opacity, const std::string& filePath, TextureType textureType)
{
    if (RichElementEx::init(tag, color, opacity))
    {
        _filePath = filePath;
        _textureType = textureType;
        return true;
    }
    return false;
}

RichElementCustomNodeEx* RichElementCustomNodeEx::create(int tag, const Color3B &color, GLubyte opacity, cocos2d::Node *customNode)
{
    RichElementCustomNodeEx* element = new RichElementCustomNodeEx();
    if (element && element->init(tag, color, opacity, customNode))
    {
        element->autorelease();
        return element;
    }
    CC_SAFE_DELETE(element);
    return nullptr;
}

bool RichElementCustomNodeEx::init(int tag, const Color3B &color, GLubyte opacity, cocos2d::Node *customNode)
{
    if (RichElementEx::init(tag, color, opacity))
    {
        _customNode = customNode;
        _customNode->retain();
        return true;
    }
    return false;
}

RichElementNewLineEx* RichElementNewLineEx::create(int tag)
{
    RichElementNewLineEx* element = new RichElementNewLineEx();
    if (element && element->init(tag))
    {
        element->autorelease();
        return element;
    }
    CC_SAFE_DELETE(element);
    return nullptr;
}

bool RichElementNewLineEx::init(int tag)
{
    if (RichElementEx::init(tag, Color3B::WHITE, 0))
    {
        return true;
    }
    return false;
}

RichTextEx::RichTextEx():
_formatTextDirty(true),
_leftSpaceWidth(0.0f),
_verticalSpace(0.0f),
_emptyLineHeight(0.0f),
_hAlignment(TextHAlignment::LEFT),
_elementRenderersContainer(nullptr)
{
    
}

RichTextEx::~RichTextEx()
{
    _richElements.clear();
}

RichTextEx* RichTextEx::create()
{
    RichTextEx* widget = new RichTextEx();
    if (widget && widget->init())
    {
        widget->autorelease();
        return widget;
    }
    CC_SAFE_DELETE(widget);
    return nullptr;
}

bool RichTextEx::init()
{
    if (Widget::init())
    {
        this->ignoreContentAdaptWithSize(false);
        this->setContentSize(Size(Director::getInstance()->getWinSize().width, 0.0f));
        return true;
    }
    return false;
}

void RichTextEx::initRenderer()
{
    _elementRenderersContainer = Node::create();
    _elementRenderersContainer->setAnchorPoint(Vec2(0.5f, 0.5f));
    addProtectedChild(_elementRenderersContainer, 0, -1);
}

void RichTextEx::insertElement(RichElementEx *element, int index)
{
    _richElements.insert(index, element);
    _formatTextDirty = true;
}

void RichTextEx::pushBackElement(RichElementEx *element)
{
    _richElements.pushBack(element);
    _formatTextDirty = true;
}

void RichTextEx::removeElement(int index)
{
    _richElements.erase(index);
    _formatTextDirty = true;
}

void RichTextEx::removeElement(RichElementEx *element)
{
    _richElements.eraseObject(element);
    _formatTextDirty = true;
}

void RichTextEx::formatText()
{
    if (_formatTextDirty)
    {
        _elementRenderersContainer->removeAllChildren();
        _elementRenders.clear();
        if (_ignoreSize)
        {
            addNewLine();
            for (ssize_t i=0; i<_richElements.size(); i++)
            {
                RichElementEx* element = _richElements.at(i);
                Node* elementRenderer = nullptr;
                switch (element->_type)
                {
                    case RichElementEx::Type::TEXT:
                    {
                        RichElementTextEx* elmtText = static_cast<RichElementTextEx*>(element);
                        if (FileUtils::getInstance()->isFileExist(elmtText->_fontName))
                        {
                            elementRenderer = Label::createWithTTF(elmtText->_text, elmtText->_fontName, elmtText->_fontSize);
                        }
                        else
                        {
                            elementRenderer = Label::createWithSystemFont(elmtText->_text, elmtText->_fontName, elmtText->_fontSize);
                        }
                        break;
                    }
                    case RichElementEx::Type::IMAGE:
                    {
                        RichElementImageEx* elmtImage = static_cast<RichElementImageEx*>(element);
                        if (elmtImage->_textureType == RichElementImageEx::TextureType::LOCAL)
                        {
                            elementRenderer = Sprite::create(elmtImage->_filePath);
                        }
                        else
                        {
                            elementRenderer = Sprite::createWithSpriteFrameName(elmtImage->_filePath);
                        }
                        break;
                    }
                    case RichElementEx::Type::CUSTOM:
                    {
                        RichElementCustomNodeEx* elmtCustom = static_cast<RichElementCustomNodeEx*>(element);
                        elementRenderer = elmtCustom->_customNode;
                        break;
                    }
                    case RichElementEx::Type::NEWLINE:
                    {
                        break;
                    }
                    default:
                        break;
                }
                elementRenderer->setUserData(element);
                elementRenderer->setColor(element->_color);
                elementRenderer->setOpacity(element->_opacity);
                pushToContainer(elementRenderer);
            }
        }
        else
        {
            addNewLine();
            for (ssize_t i=0; i<_richElements.size(); i++)
            {
                
                RichElementEx* element = _richElements.at(i);
                switch (element->_type)
                {
                    case RichElementEx::Type::TEXT:
                    {
                        RichElementTextEx* elmtText = static_cast<RichElementTextEx*>(element);
                        handleTextRenderer(elmtText, elmtText->_text, elmtText->_fontName, elmtText->_fontSize, elmtText->_color, elmtText->_opacity);
                        break;
                    }
                    case RichElementEx::Type::IMAGE:
                    {
                        RichElementImageEx* elmtImage = static_cast<RichElementImageEx*>(element);
                        handleImageRenderer(elmtImage, elmtImage->_filePath, elmtImage->_color, elmtImage->_opacity);
                        break;
                    }
                    case RichElementEx::Type::CUSTOM:
                    {
                        RichElementCustomNodeEx* elmtCustom = static_cast<RichElementCustomNodeEx*>(element);
                        handleCustomRenderer(element, elmtCustom->_customNode);
                        break;
                    }
                    case RichElementEx::Type::NEWLINE:
                    {
                        addNewLine();
                        break;
                    }
                    default:
                        break;
                }
            }
        }
        formatRenderers();
        _formatTextDirty = false;
    }
}

void RichTextEx::handleTextRenderer(RichElementTextEx* elmtText, const std::string& text, const std::string& fontName, float fontSize, const Color3B &color, GLubyte opacity)
{
    auto fileExist = FileUtils::getInstance()->isFileExist(fontName);
    Label* textRenderer = nullptr;
    
    // support new line
    std::string::size_type pos = text.find('\n');
    std::string subText;
    if (pos != std::string::npos)
    {
        subText = text.substr(0, pos);
        if (fileExist)
        {
            textRenderer = Label::createWithTTF(subText, fontName, fontSize);
        }
        else
        {
            textRenderer = Label::createWithSystemFont(subText, fontName, fontSize);
        }
    }
    else
    {
        if (fileExist)
        {
            textRenderer = Label::createWithTTF(text, fontName, fontSize);
        }
        else
        {
            textRenderer = Label::createWithSystemFont(text, fontName, fontSize);
        }
    }
    float textRendererWidth = textRenderer->getContentSize().width;
    _leftSpaceWidth -= textRendererWidth;
    if (_leftSpaceWidth < 0.0f)
    {
        float overstepPercent = (-_leftSpaceWidth) / textRendererWidth;
        std::string curText = (pos == std::string::npos) ? text : subText;
        size_t stringLength = StringUtils::getCharacterCountInUTF8String(curText);
        int leftLength = stringLength * (1.0f - overstepPercent);
        std::string leftWords = utf8_substr(curText,0,leftLength);
        std::string cutWords = utf8_substr(curText, leftLength, curText.length() - leftLength);
        if (leftLength > 0)
        {
            Label* leftRenderer = nullptr;
            if (fileExist)
            {
                leftRenderer = Label::createWithTTF(utf8_substr(leftWords, 0, leftLength), fontName, fontSize);
            }
            else
            {
                leftRenderer = Label::createWithSystemFont(utf8_substr(leftWords, 0, leftLength), fontName, fontSize);
            }
            if (leftRenderer)
            {
                Node* nodeRenderer = Node::create();
                nodeRenderer->setContentSize(leftRenderer->getContentSize());
                nodeRenderer->addChild(leftRenderer);
                leftRenderer->setAnchorPoint(Vec2::ZERO);
                if (elmtText->_outlineEnable)
                {
                    leftRenderer->enableOutline(Color4B(elmtText->_outlineColor), elmtText->_outlineSize);
                }
                if (elmtText->_underlineEnable)
                {
                    LayerColor *underline = LayerColor::create(Color4B(color));
                    underline->setContentSize(Size(leftRenderer->getContentSize().width, 2));
                    nodeRenderer->addChild(underline);
                    underline->setAnchorPoint(Vec2::ZERO);
                }
                leftRenderer->setColor(color);
                leftRenderer->setOpacity(opacity);
                nodeRenderer->setUserData(elmtText);
                pushToContainer(nodeRenderer);
            }
        }
        
        addNewLine();
        handleTextRenderer(elmtText, cutWords, fontName, fontSize, color, opacity);
    }
    else
    {
        Node* nodeRenderer = Node::create();
        nodeRenderer->setContentSize(textRenderer->getContentSize());
        nodeRenderer->addChild(textRenderer);
        textRenderer->setAnchorPoint(Vec2::ZERO);
        if (elmtText->_outlineEnable)
        {
            textRenderer->enableOutline(Color4B(elmtText->_outlineColor), elmtText->_outlineSize);
        }
        if (elmtText->_underlineEnable)
        {
            LayerColor *underline = LayerColor::create(Color4B(color));
            underline->setContentSize(Size(textRendererWidth, 2));
            nodeRenderer->addChild(underline);
            underline->setAnchorPoint(Vec2::ZERO);
        }
        textRenderer->setColor(color);
        textRenderer->setOpacity(opacity);
        nodeRenderer->setUserData(elmtText);
        pushToContainer(nodeRenderer);
    }
    
    // remainder
    if (pos != std::string::npos)
    {
        addNewLine();
        handleTextRenderer(elmtText, std::string(text.c_str() + pos + 1), fontName, fontSize, color, opacity);
    }
}

void RichTextEx::handleImageRenderer(RichElementImageEx* elmtImage, const std::string& fileParh, const Color3B &color, GLubyte opacity)
{
    Node* nodeRenderer = Node::create();
    Sprite* imageRenderer;
    if (elmtImage->_textureType == RichElementImageEx::TextureType::LOCAL)
    {
        imageRenderer = Sprite::create(fileParh);
    }
    else
    {
        imageRenderer = Sprite::createWithSpriteFrameName(fileParh);
    }
    nodeRenderer->setUserData(elmtImage);

    const Size& imgSize = imageRenderer->getContentSize();
    Size nodeSize(imgSize.width * elmtImage->_scaleX, imgSize.height * elmtImage->_scaleY);
    nodeRenderer->setContentSize(nodeSize);
    nodeRenderer->addChild(imageRenderer);
    imageRenderer->setScale(elmtImage->_scaleX, elmtImage->_scaleY);
    imageRenderer->setAnchorPoint(Vec2::ZERO);

    _leftSpaceWidth -= nodeSize.width;
    if (_leftSpaceWidth < 0.0f)
    {
        addNewLine();
        pushToContainer(nodeRenderer);
        _leftSpaceWidth -= nodeSize.width;
    }
    else
    {
        pushToContainer(nodeRenderer);
    }
}

void RichTextEx::handleCustomRenderer(RichElementEx* element, cocos2d::Node *renderer)
{
    const Size& nodeSize = renderer->getContentSize();

    Node* rendererNode = Node::create();
    rendererNode->setContentSize(nodeSize);
    rendererNode->addChild(renderer);
    renderer->setAnchorPoint(Vec2::ZERO);
    rendererNode->setUserData(element);

    _leftSpaceWidth -= nodeSize.width;
    if (_leftSpaceWidth < 0.0f)
    {
        addNewLine();
        pushToContainer(rendererNode);
        _leftSpaceWidth -= nodeSize.width;
    }
    else
    {
        pushToContainer(rendererNode);
    }
}

void RichTextEx::addNewLine()
{
    _leftSpaceWidth = _customSize.width;
    _elementRenders.push_back(new Vector<Node*>());
}

void RichTextEx::formatRenderers()
{
    if (_ignoreSize)
    {
        float newContentSizeWidth = 0.0f;
        float newContentSizeHeight = 0.0f;
        
        Vector<Node*>* row = (_elementRenders[0]);
        float nextPosX = 0.0f;
        for (ssize_t j=0; j<row->size(); j++)
        {
            Node* l = row->at(j);
            l->setAnchorPoint(Vec2::ZERO);
            l->setPosition(Vec2(nextPosX, 0.0f));
            _elementRenderersContainer->addChild(l, 1);
            Size iSize = l->getContentSize();
            newContentSizeWidth += iSize.width;
            newContentSizeHeight = MAX(newContentSizeHeight, iSize.height);
            nextPosX += iSize.width;
        }
        _elementRenderersContainer->setContentSize(Size(newContentSizeWidth, newContentSizeHeight));
    }
    else
    {
        float newContentSizeHeight = 0.0f;
        Size *rowSizes = new Size[_elementRenders.size()];
        
        for (size_t i=0,length=_elementRenders.size(); i<length; ++i)
        {
            Vector<Node*>* row = (_elementRenders[i]);
            float rowWidth = 0.0f;
            float maxHeight = 0.0f;
            for (auto it=row->begin(),end=row->end(); it!=end; ++it)
            {
                Node* l = *it;
                const Size& s = l->getContentSize();
                rowWidth += s.width;
                maxHeight = MAX(s.height, maxHeight);
            }
            rowSizes[i].width = rowWidth;
            rowSizes[i].height = row->empty() ? _emptyLineHeight : maxHeight;
            newContentSizeHeight += (rowSizes[i].height + _verticalSpace);
        }
        
        newContentSizeHeight -= _verticalSpace;
        _customSize.height = newContentSizeHeight;
        
        float nextPosY = _customSize.height;
        for (size_t i=0,length=_elementRenders.size(); i<length; ++i)
        {
            Vector<Node*>* row = _elementRenders[i];
            float nextPosX = 0.0f;
            switch (_hAlignment)
            {
                case TextHAlignment::LEFT: break;
                case TextHAlignment::CENTER: nextPosX += (_contentSize.width-rowSizes[i].width)*0.5f; break;
                case TextHAlignment::RIGHT: nextPosX += (_contentSize.width-rowSizes[i].width); break;
                default: break;
            }
            nextPosY -= rowSizes[i].height;
            
            for (auto it=row->begin(),end=row->end(); it!=end; ++it)
            {
                Node* l = *it;
                l->setAnchorPoint(Vec2::ZERO);
                l->setPosition(Vec2(nextPosX, nextPosY));
                _elementRenderersContainer->addChild(l, 1);
                nextPosX += l->getContentSize().width;
            }
            nextPosY -= _verticalSpace;
        }
        
        _elementRenderersContainer->setContentSize(_customSize);
        delete [] rowSizes;
    }
    
    size_t length = _elementRenders.size();
    for (size_t i = 0; i<length; i++)
    {
        Vector<Node*>* l = _elementRenders[i];
        l->clear();
        delete l;
    }    
    _elementRenders.clear();
    
    if (_ignoreSize)
    {
        Size s = getVirtualRendererSize();
        this->setContentSize(s);
    }
    else
    {
        this->setContentSize(_customSize);
    }
    updateContentSizeWithTextureSize(_contentSize);
    _elementRenderersContainer->setPosition(_contentSize.width / 2.0f, _contentSize.height / 2.0f);
}

void RichTextEx::pushToContainer(cocos2d::Node *renderer)
{
    if (_elementRenders.size() <= 0)
    {
        return;
    }
    _elementRenders[_elementRenders.size()-1]->pushBack(renderer);
}

void RichTextEx::visit(cocos2d::Renderer *renderer, const Mat4 &parentTransform, uint32_t parentFlags)
{
    if (_enabled)
    {
        formatText();
        Widget::visit(renderer, parentTransform, parentFlags);
    }
}

void RichTextEx::setVerticalSpace(float space)
{
    if (_verticalSpace != space)
    {
        _verticalSpace = space;
        _formatTextDirty = true;
    }
}
    
float RichTextEx::getVerticalSpace() const
{
    return _verticalSpace;
}

void RichTextEx::setEmptyLineHeight(float height)
{
    if (_emptyLineHeight != height)
    {
        _emptyLineHeight = height;
        _formatTextDirty = true;
    }
}

float RichTextEx::getEmptyLineHeight() const
{
    return _emptyLineHeight;
}

void RichTextEx::setHorizontalAlignment(TextHAlignment alignment)
{
    if (_hAlignment != alignment)
    {
        _hAlignment = alignment;
        _formatTextDirty = true;
    }
}

TextHAlignment RichTextEx::getHorizontalAlignment() const
{
    return _hAlignment;
}

void RichTextEx::setAnchorPoint(const Vec2 &pt)
{
    Widget::setAnchorPoint(pt);
}

//const Size& RichTextEx::getVirtualRendererSize() const
//{
//    return _elementRenderersContainer->getContentSize();
//}

void RichTextEx::ignoreContentAdaptWithSize(bool ignore)
{
    if (_ignoreSize != ignore)
    {
        _formatTextDirty = true;
        Widget::ignoreContentAdaptWithSize(ignore);
    }
}
    
void RichTextEx::releaseUpEvent()
{
    Vector<Node*> &children = _elementRenderersContainer->getChildren();
    if (!children.empty())
    {
        Vec2 pt = convertToNodeSpace(_touchBeganPosition);
        for (auto it = children.begin(); it != children.end(); ++it)
        {
            Node *node = *it;
            Rect bb(node->getBoundingBox());
            if (bb.containsPoint(pt))
            {
                RichElementEx* element = static_cast<RichElementEx*>(node->getUserData());
                if (element != nullptr && element->_clickCallback != nullptr)
                {
                    (element->_clickCallback)(this, element);
                }
                break;
            }
        }
    }
    
    Widget::releaseUpEvent();
}

void RichTextEx::cancelUpEvent()
{
    Widget::cancelUpEvent();
}

std::string RichTextEx::getDescription() const
{
    return "RichTextEx";
}

}

NS_CC_END
